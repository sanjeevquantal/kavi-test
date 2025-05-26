import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useStories } from '@/contexts/StoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  saveUserConversation, 
  fetchEnhancedConversationMemory,
  storeConversationMessage,
  fetchElevenLabsConversation,
  storeConversationSummary,
  fetchConversationSummaries,
  updateCumulativeSummary
} from '@/utils/elevenlabsHelper';

type ConversationMode = 'listening' | 'speaking';
type ConversationStatus = 'disconnected' | 'connected';
type ConversationType = 'delivery' | 'star' | 'scratch';
type ConversationMessage = {
  role: 'ai' | 'user';
  content: string;
};

export const useElevenLabsConversation = (type: ConversationType, storyId?: string) => {
  const [status, setStatus] = useState<ConversationStatus>('disconnected');
  const [mode, setMode] = useState<ConversationMode>('listening');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationModule, setConversationModule] = useState<any>(null);
  const [isModuleLoaded, setIsModuleLoaded] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [elevenLabsConversationId, setElevenLabsConversationId] = useState<string | null>(null);
  const [conversationMemory, setConversationMemory] = useState<string | null>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [conversationSummaries, setConversationSummaries] = useState<any[]>([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [hasCumulativeMemory, setHasCumulativeMemory] = useState(false);
  const [cumulativeSummary, setCumulativeSummary] = useState<string>('');
  const [isMemoryPreloaded, setIsMemoryPreloaded] = useState(false);
  const conversationRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inactivityTimerRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const INACTIVITY_TIMEOUT = 180000; // 3 minutes of inactivity
  const { updateStory, getStoryById } = useStories();
  const { user, profile } = useAuth();

  // Get the API key from environment variables
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  // Validate API key on initialization
  useEffect(() => {
    if (!apiKey) {
      console.error('❌ ELEVENLABS_API_KEY is not configured');
      toast.error("ElevenLabs API key is missing. Please configure it in your environment variables.");
    } else {
      console.log('✅ ElevenLabs API key is configured');
    }
  }, [apiKey]);

  // Load conversation summaries
  const loadConversationSummaries = async () => {
    if (!user) return [];
    
    try {
      setIsLoadingSummaries(true);
      console.log('📚 STARTING SUMMARY FETCH: Getting conversation summaries from database...');
      const summaries = await fetchConversationSummaries();
      setConversationSummaries(summaries);
      console.log(`📚 SUMMARY FETCH COMPLETE: Found ${summaries.length} conversation summaries`);
      return summaries;
    } catch (error) {
      console.error("Failed to load conversation summaries:", error);
      return [];
    } finally {
      setIsLoadingSummaries(false);
    }
  };

  // Load conversation memory and extract cumulative summary
  const loadConversationMemory = async () => {
    if (!user) return;
    
    try {
      setIsLoadingMemory(true);
      console.log('📚 MEMORY PRELOAD: Starting enhanced conversation memory retrieval...');
      
      // Use the enhanced memory function that includes cumulative summary
      const memory = await fetchEnhancedConversationMemory();
      setConversationMemory(memory);
      
      // Check if the memory contains cumulative summary and extract it
      const hasCumulative = memory ? memory.includes('IMPORTANT CONTEXT') : false;
      setHasCumulativeMemory(hasCumulative);
      
      if (hasCumulative && memory) {
        // Extract the cumulative summary from the memory string
        try {
          const startMarker = "You have access to all previous conversations with this user. Here's a summary of everything you've discussed so far:\n\n";
          const endMarker = "\n\nIf the user asks about past conversations";
          const startIndex = memory.indexOf(startMarker) + startMarker.length;
          const endIndex = memory.indexOf(endMarker);
          
          if (startIndex >= 0 && endIndex > startIndex) {
            const extractedSummary = memory.substring(startIndex, endIndex).trim();
            console.log("📚 MEMORY PRELOAD: Extracted cumulative summary successfully:", extractedSummary.substring(0, 100) + "...");
            setCumulativeSummary(extractedSummary);
          } else {
            console.log("📚 MEMORY PRELOAD: Could not extract cumulative summary from memory string");
            setCumulativeSummary('');
          }
        } catch (err) {
          console.error("📚 MEMORY PRELOAD: Error extracting cumulative summary:", err);
          setCumulativeSummary('');
        }
      } else {
        console.log("📚 MEMORY PRELOAD: No cumulative memory marker found");
        setCumulativeSummary('');
      }
      
      setIsMemoryPreloaded(true);
      console.log("📚 MEMORY PRELOAD COMPLETE:", {
        memoryLoaded: !!memory,
        hasCumulative,
        summaryLength: cumulativeSummary.length
      });
      
    } catch (error) {
      console.error("📚 MEMORY PRELOAD: Failed to load conversation memory:", error);
      setIsMemoryPreloaded(true); // Mark as complete even on error to avoid blocking
    } finally {
      setIsLoadingMemory(false);
    }
  };

  // Preload memory when user is available
  useEffect(() => {
    if (user && !isMemoryPreloaded && !isLoadingMemory) {
      console.log("📚 MEMORY PRELOAD: User detected, starting memory preload...");
      loadConversationMemory();
      loadConversationSummaries();
    }
  }, [user, isMemoryPreloaded, isLoadingMemory]);

  // Get user information for the agent
  const getUserInfo = () => {
    // First check for Supabase auth
    if (profile) {
      return {
        user_name: profile.username || profile.full_name || "User"
      };
    }
    
    // Then check for Google user
    try {
      const googleUserStr = localStorage.getItem('google_user');
      if (googleUserStr) {
        const googleUser = JSON.parse(googleUserStr);
        return {
          user_name: googleUser.name || googleUser.given_name || "User"
        };
      }
    } catch (err) {
      console.error("Error parsing Google user:", err);
    }
    
    // Default fallback
    return { user_name: "User" };
  };

  // Clear inactivity timer when component unmounts
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (status === 'connected') {
      inactivityTimerRef.current = setTimeout(() => {
        toast.info("You've been inactive for a while. The conversation will end soon if there's no activity.");
        
        // Give another minute before actually disconnecting
        setTimeout(() => {
          if (status === 'connected') {
            stopConversation();
          }
        }, 60000);
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    // Load ElevenLabs client
    let isMounted = true;
    
    const loadElevenLabsClient = async () => {
      try {
        console.log("Loading ElevenLabs client...");
        // Import client synchronously to speed up loading
        const module = await import('@11labs/client');
        if (isMounted) {
          console.log("ElevenLabs client loaded successfully");
          setConversationModule(module);
          setIsModuleLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load ElevenLabs client:", err);
        if (isMounted) {
          toast.error("Failed to load ElevenLabs client. Please refresh the page and try again.");
        }
      }
    };

    // Load immediately
    loadElevenLabsClient();
    
    // Also load conversation memory and summaries if the user is authenticated
    if (user) {
      loadConversationMemory();
      loadConversationSummaries();
    }

    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (conversationRef.current) {
        console.log("Component unmounting, cleaning up conversation");
        const currentConvRef = conversationRef.current;
        conversationRef.current = null;
        currentConvRef.endSession().catch((err: Error) => {
          console.error("Error ending session on unmount:", err);
        });
      }
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    // Reload memory and summaries when user changes
    if (user) {
      loadConversationMemory();
      loadConversationSummaries();
    }
  }, [user]);

  useEffect(() => {
    // Reset inactivity timer whenever user speaks or AI speaks
    if (mode === 'listening' || mode === 'speaking') {
      resetInactivityTimer();
    }
  }, [mode, status]);

  const getPrompt = () => {
    // Create a more explicit prompt that instructs the AI to use the existing context
    let basePrompt = "";
    
    switch(type) {
      case 'delivery': 
        basePrompt = "You are an interview coach helping the user practice their interview delivery. Give constructive feedback on their speaking style, clarity, and confidence.";
        break;
      case 'star':
        basePrompt = "You are an interview coach helping the user structure their interview responses using the STAR method (Situation, Task, Action, Result). Guide them through creating effective stories using this framework.";
        break;
      case 'scratch':
        basePrompt = "You are an interview coach helping the user create new interview stories from scratch. Help them identify relevant experiences and structure them effectively for interviews.";
        break;
    }
    
    // Add explicit instruction to use memory context
    basePrompt += "\n\nIMPORTANT: You have access to previous conversations with this user through the cumulative_summary provided in your dynamic variables. When the user asks about previous conversations or refers to past discussions, use this summary to provide relevant context and continuity. DO NOT say you don't have access to previous interactions when you have been provided with a cumulative summary.";
    
    console.log("📝 PROMPT: Base prompt created for agent:", basePrompt);
    
    return basePrompt;
  };

  const startConversation = async () => {
    // Validate API key first
    if (!apiKey) {
      console.error("❌ CONVERSATION START: API key is missing");
      toast.error("ElevenLabs API key is missing. Please configure it in your environment variables.");
      setIsLoading(false);
      return;
    }

    if (!isModuleLoaded || !conversationModule) {
      console.error("❌ CONVERSATION START: ElevenLabs client not loaded");
      toast.error("ElevenLabs client is still loading. Please wait a moment and try again.");
      setIsLoading(false);
      return;
    }

    // Ensure memory is preloaded before starting conversation
    if (user && !isMemoryPreloaded) {
      console.log("📚 CONVERSATION START: Memory not preloaded, loading now...");
      setIsLoading(true);
      await loadConversationMemory();
      await loadConversationSummaries();
    }

    try {
      setIsLoading(true);
      console.log("🎤 CONVERSATION START: Requesting microphone access...");
      await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log("📝 CONVERSATION START: Starting conversation with enhanced context");
      console.log("📝 CONVERSATION START: Cumulative summary available:", !!cumulativeSummary);
      console.log("📝 CONVERSATION START: Summary length:", cumulativeSummary.length);
      if (cumulativeSummary) {
        console.log("📝 CONVERSATION START: Summary preview:", cumulativeSummary.substring(0, 150) + "...");
      }

      // Clear previous messages and audio chunks
      setMessages([]);
      audioChunksRef.current = [];
      setElevenLabsConversationId(null);
      reconnectAttemptsRef.current = 0;
      
      // Get user information for the agent
      const userInfo = getUserInfo();
      console.log("📝 CONVERSATION START: Using user info:", userInfo);

      // Prepare dynamic variables with cumulative summary
      const dynamicVariables = {
        user_name: userInfo.user_name,
        cumulative_summary: cumulativeSummary || "No previous conversation history available. This appears to be your first interaction with this user."
      };

      console.log("📝 CONVERSATION START: Dynamic variables prepared:", {
        user_name: dynamicVariables.user_name,
        has_summary: !!cumulativeSummary,
        summary_length: dynamicVariables.cumulative_summary.length
      });

      console.log("📝 CONVERSATION START: Starting session with Agent ID: zigQs2Ud9a6CaLcDfKGh");
      
      // Validate the conversation module before using it
      if (!conversationModule.Conversation) {
        throw new Error("Conversation module not properly loaded");
      }

      const conversation = await conversationModule.Conversation.startSession({
        apiKey: apiKey,
        // agentId: 'zigQs2Ud9a6CaLcDfKGh',
        agentId: '2bOmKol1UOw3Q9dZTV3O',
        dynamicVariables: dynamicVariables,
        variables: userInfo, // Pass user information as variables
        // overrides: {
        //   agent: {
        //     prompt: {
        //       prompt: getPrompt()
        //     }
        //   }
        // },
        onConnect: async (sessionData: any) => {
          console.log("✅ CONVERSATION START: Successfully connected to ElevenLabs");
          setStatus('connected');
          // Store the conversation ID when the connection is established
          if (sessionData && sessionData.conversationId) {
            console.log("📝 CONVERSATION START: Conversation ID received:", sessionData.conversationId);
            setElevenLabsConversationId(sessionData.conversationId);
            
            // Save the conversation ID to user mappings
            try {
              await saveUserConversation(sessionData.conversationId);
              console.log("📝 CONVERSATION START: Conversation mapping saved successfully");
            } catch (error) {
              console.error("📝 CONVERSATION START: Error saving conversation mapping:", error);
              // Non-critical error, don't block the conversation
            }
          } else {
            console.log("📝 CONVERSATION START: No conversation ID in session data:", sessionData);
          }
          toast.success(`${getTitle(type)} connected`);
          setIsLoading(false);
          resetInactivityTimer();
        },
        onDisconnect: (reason?: string) => {
          console.log("🔌 CONVERSATION: Disconnected:", reason);
          
          // Only attempt reconnect for unexpected disconnections during active conversation
          if (conversationRef.current && status === 'connected' && reason !== 'user_initiated' && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            toast.info(`Connection lost. Attempting to reconnect... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
            
            // Try to reconnect after a short delay
            setTimeout(() => {
              if (conversationRef.current) {
                startConversation();
              }
            }, 2000);
            return;
          }
          
          setStatus('disconnected');
          if (conversationRef.current) {
            toast.info(`${getTitle(type)} disconnected.`);
          }
          setIsLoading(false);
          conversationRef.current = null;
          
          // Create audio blob from collected chunks
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            
            // Save conversation to story if we have a storyId
            if (storyId && messages.length > 0) {
              const story = getStoryById(storyId);
              if (story) {
                updateStory(storyId, {
                  ...story,
                  elevenLabsConversationId: elevenLabsConversationId, // Save the conversation ID
                  conversation: {
                    messages: [...messages],
                    audioUrl: url,
                    timestamp: new Date().toISOString()
                  },
                  updatedAt: new Date().toISOString()
                });
                toast.success("Conversation saved to story");
              }
            }
          }
          
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
          }
        },
        onError: (error: any) => {
          console.error("❌ CONVERSATION ERROR:", error);
          
          // Provide more specific error messages
          let errorMessage = "Conversation Error: ";
          if (error?.message?.includes('authorize')) {
            errorMessage += "Authentication failed. Please check your ElevenLabs API key.";
          } else if (error?.message?.includes('network')) {
            errorMessage += "Network connection failed. Please check your internet connection.";
          } else {
            errorMessage += error?.message || 'Unknown error';
          }
          
          toast.error(errorMessage);
          
          // Try to reconnect on error if not exceeding max attempts
          if (status === 'connected' && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            toast.info(`Connection error. Attempting to reconnect... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
            
            // Try to reconnect after a short delay
            setTimeout(() => {
              if (conversationRef.current) {
                startConversation();
              }
            }, 2000);
            return;
          }
          
          setStatus('disconnected');
          setIsLoading(false);
          conversationRef.current = null;
          
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
          }
        },
        onModeChange: (modeInfo: any) => {
          console.log("🔄 CONVERSATION: Mode changed to:", modeInfo.mode);
          setMode(modeInfo.mode === 'speaking' ? 'speaking' : 'listening');
          resetInactivityTimer();
        },
        onMessage: async (message: any) => {
          console.log("💬 CONVERSATION: Message received:", message);
          
          // Only process final messages, not tentative ones
          if (message.source === 'ai' || message.source === 'user') {
            const newMessage = {
              role: message.source,
              content: message.message
            };
            
            setMessages(prevMessages => [...prevMessages, newMessage]);
            
            // Store message in conversation memory database
            if (elevenLabsConversationId) {
              try {
                await storeConversationMessage(
                  elevenLabsConversationId,
                  message.source,
                  message.message
                );
              } catch (error) {
                console.error("❌ Failed to store conversation message:", error);
                // Non-critical error, don't block the conversation
              }
            }
          }
          
          // Store audio chunks for later playback
          if (message.audioChunk) {
            audioChunksRef.current.push(message.audioChunk);
          }
          
          // Reset inactivity timer on message activity
          resetInactivityTimer();
        }
      });

      conversationRef.current = conversation;

    } catch (error: any) {
      console.error("❌ CONVERSATION START FAILED:", error);
      let detailedMessage = 'Failed to start conversation.';
      
      if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
        detailedMessage = 'Microphone permission denied. Please allow access and try again.';
      } else if (error.message?.includes('authorize') || error.message?.includes('401')) {
        detailedMessage = 'Authentication failed. Please check your ElevenLabs API key configuration.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        detailedMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        detailedMessage += ` Error: ${error.message}`;
      }
      
      toast.error(detailedMessage);
      setIsLoading(false);
      setStatus('disconnected');
    }
  };

  const stopConversation = async () => {
    if (conversationRef.current) {
      try {
        const currentConvRef = conversationRef.current;
        conversationRef.current = null;
        await currentConvRef.endSession();
        setStatus('disconnected');
        toast.info(`${getTitle(type)} disconnected.`);

        // After the conversation ends, fetch the conversation details to check for summary
        if (elevenLabsConversationId) {
          console.log(`👀 SUMMARY CHECK: Will fetch conversation details for ID: ${elevenLabsConversationId}`);
          
          // Start by immediately fetching conversation details
          try {
            console.log(`🔍 SUMMARY CHECK: Immediate fetch attempt for conversation details`);
            const conversationDetails = await fetchElevenLabsConversation(elevenLabsConversationId);
            console.log("🔍 IMMEDIATE RESPONSE STRUCTURE:", Object.keys(conversationDetails || {}).join(', '));
            
            // If we found summary directly in the API response
            if (conversationDetails?.extracted_summary) {
              console.log('✅ SUMMARY FOUND: Summary successfully extracted and stored from immediate check:', 
                conversationDetails.extracted_summary.substring(0, 100) + '...');
              
              // Update the cumulative summary with this new summary
              try {
                console.log('🧠 Updating cumulative summary with new conversation data');
                await updateCumulativeSummary(conversationDetails.extracted_summary);
                console.log('🧠 Cumulative summary updated successfully');
                // Refresh the memory for next conversation
                setIsMemoryPreloaded(false);
              } catch (summaryError) {
                console.error('Error updating cumulative summary:', summaryError);
                // Non-critical error, don't block the operation
              }
              
              await loadConversationSummaries();
              return;
            } else if (conversationDetails?.data_collection_results?.summary) {
              // DIRECT PATH CHECK: Specifically check the data_collection_results.summary path
              console.log('✅ SUMMARY FOUND in data_collection_results.summary:', 
                conversationDetails.data_collection_results.summary.substring(0, 100) + '...');
                
              // Store this summary directly and update the cumulative summary
              await storeConversationSummary(
                elevenLabsConversationId,
                conversationDetails.data_collection_results.summary
              );
              
              try {
                console.log('🧠 Updating cumulative summary with data_collection_results.summary');
                await updateCumulativeSummary(conversationDetails.data_collection_results.summary);
                console.log('🧠 Cumulative summary updated successfully');
                // Refresh the memory for next conversation
                setIsMemoryPreloaded(false);
              } catch (summaryError) {
                console.error('Error updating cumulative summary:', summaryError);
                // Non-critical error, don't block the operation
              }
              
              // Reload summaries to update UI
              await loadConversationSummaries();
              return;
            }
            
            console.log('⚠️ No summary found in immediate check, will try again after delay');
          } catch (error) {
            console.error('❌ Error in immediate summary check:', error);
          }
          
          // Try again after 5 seconds
          setTimeout(async () => {
            try {
              console.log(`🔍 SUMMARY CHECK: Second attempt after 5s delay`);
              const conversationDetails = await fetchElevenLabsConversation(elevenLabsConversationId);
              console.log("🔍 5s DELAY RESPONSE STRUCTURE:", Object.keys(conversationDetails || {}).join(', '));
              
              // Direct path check first
              if (conversationDetails?.data_collection_results?.summary) {
                console.log('✅ SUMMARY FOUND in data_collection_results.summary (5s delay):', 
                  conversationDetails.data_collection_results.summary.substring(0, 100) + '...');
                  
                await storeConversationSummary(
                  elevenLabsConversationId,
                  conversationDetails.data_collection_results.summary
                );
                
                try {
                  console.log('🧠 Updating cumulative summary with data_collection_results.summary (5s delay)');
                  await updateCumulativeSummary(conversationDetails.data_collection_results.summary);
                  console.log('🧠 Cumulative summary updated successfully');
                  // Refresh the memory for next conversation
                  setIsMemoryPreloaded(false);
                } catch (summaryError) {
                  console.error('Error updating cumulative summary:', summaryError);
                }
                
                await loadConversationSummaries();
                return;
              }
              
              // If we found summary in this attempt
              if (conversationDetails?.extracted_summary) {
                console.log('✅ SUMMARY FOUND: Summary successfully extracted and stored from 5s delay check');
                
                try {
                  console.log('🧠 Updating cumulative summary with extracted_summary (5s delay)');
                  await updateCumulativeSummary(conversationDetails.extracted_summary);
                  console.log('🧠 Cumulative summary updated successfully');
                  // Refresh the memory for next conversation
                  setIsMemoryPreloaded(false);
                } catch (summaryError) {
                  console.error('Error updating cumulative summary:', summaryError);
                }
                
                await loadConversationSummaries();
                return;
              }
              
              console.log('⚠️ No summary found after 5s delay, will try final check');
              
              // Final attempt after another delay
              setTimeout(async () => {
                try {
                  console.log(`🔍 SUMMARY CHECK: Final attempt after 15s total delay`);
                  const finalDetails = await fetchElevenLabsConversation(elevenLabsConversationId);
                  console.log("🔍 15s DELAY RESPONSE STRUCTURE:", Object.keys(finalDetails || {}).join(', '));
                  
                  // Direct path check first
                  if (finalDetails?.data_collection_results?.summary) {
                    console.log('✅ SUMMARY FOUND in data_collection_results.summary (15s delay):', 
                      finalDetails.data_collection_results.summary.substring(0, 100) + '...');
                      
                    await storeConversationSummary(
                      elevenLabsConversationId,
                      finalDetails.data_collection_results.summary
                    );
                    
                    try {
                      console.log('🧠 Updating cumulative summary with data_collection_results.summary (15s delay)');
                      await updateCumulativeSummary(finalDetails.data_collection_results.summary);
                      console.log('🧠 Cumulative summary updated successfully');
                      // Refresh the memory for next conversation
                      setIsMemoryPreloaded(false);
                    } catch (summaryError) {
                      console.error('Error updating cumulative summary:', summaryError);
                    }
                    
                    await loadConversationSummaries();
                    return;
                  }
                  
                  if (finalDetails?.extracted_summary) {
                    console.log('✅ SUMMARY FOUND: Summary successfully extracted and stored from final check');
                    
                    try {
                      console.log('🧠 Updating cumulative summary with extracted_summary (final check)');
                      await updateCumulativeSummary(finalDetails.extracted_summary);
                      console.log('🧠 Cumulative summary updated successfully');
                      // Refresh the memory for next conversation
                      setIsMemoryPreloaded(false);
                    } catch (summaryError) {
                      console.error('Error updating cumulative summary:', summaryError);
                    }
                    
                    await loadConversationSummaries();
                  } else {
                    console.log('❌ SUMMARY CHECK: All attempts failed. No summary could be extracted.');
                  }
                } catch (error) {
                  console.error('❌ Error in final summary attempt:', error);
                }
              }, 10000); // Try once more after 10 more seconds (15 seconds total)
            } catch (error) {
              console.error('❌ Error in delayed summary check:', error);
            }
          }, 5000); // 5 seconds delay
        }
      } catch (error) {
        console.error("End failed:", error);
        toast.error(`Failed to end conversation: ${error?.message || 'Unknown error'}`);
        setStatus('disconnected');
      } finally {
        setIsLoading(false);
        
        // Create audio blob from collected chunks
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Save conversation to story if we have a storyId
          if (storyId && messages.length > 0) {
            const story = getStoryById(storyId);
            if (story) {
              updateStory(storyId, {
                ...story,
                elevenLabsConversationId: elevenLabsConversationId, // Save the conversation ID
                conversation: {
                  messages: [...messages],
                  audioUrl: url,
                  timestamp: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
              });
              toast.success("Conversation saved to story");
            }
          }
        }
        
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
      }
    } else {
      console.log("No conversation to stop.");
    }
  };

  return {
    status,
    mode,
    isLoading,
    isModuleLoaded,
    isLoadingMemory,
    isLoadingSummaries,
    messages,
    audioUrl,
    elevenLabsConversationId,
    conversationMemory,
    conversationSummaries,
    hasCumulativeMemory,
    cumulativeSummary,
    isMemoryPreloaded,
    startConversation,
    stopConversation,
    loadConversationMemory,
    loadConversationSummaries
  };
};

const getTitle = (type: 'delivery' | 'star' | 'scratch') => {
  switch(type) {
    case 'delivery': return 'Delivery Companion';
    case 'star': return 'STAR Method Companion';
    case 'scratch': return 'Start From Scratch';
  }
};
