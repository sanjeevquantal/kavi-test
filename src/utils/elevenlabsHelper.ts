/**
 * Helper functions to interact with ElevenLabs Convai widget
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Set the context for the conversation
 */
export const setWidgetContext = (type: 'delivery' | 'star' | 'scratch') => {
  // Log the context type for debugging
  console.log(`Setting widget context to: ${type}`);
  
  // Return appropriate message based on the context type
  switch(type) {
    case 'delivery':
      return "I'll help you practice delivering your interview stories effectively with real-time feedback on your communication style.";
    case 'star':
      return "I'll help you structure your responses using the STAR method (Situation, Task, Action, Result) for impactful storytelling.";
    case 'scratch':
      return "I'll help you create new interview stories from the beginning, guiding you through the entire process.";
    default:
      return "How can I help you with your interview preparation today?";
  }
};

/**
 * Save a conversation ID to the user's conversations
 */
export const saveUserConversation = async (conversationId: string) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when trying to save conversation');
      return false;
    }

    // Save the conversation ID to the user_conversations table
    const { error } = await supabase
      .from('user_conversations')
      .insert({
        user_id: user.id,
        conversation_id: conversationId
      })
      .select()
      .single();

    if (error) {
      // If the error is because the conversation already exists, this is fine
      if (error.code === '23505') { // Unique violation code
        console.log('Conversation already mapped to user (duplicate ignored)');
        return true;
      }
      console.error('Error saving user conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving user conversation:', error);
    return false;
  }
};

/**
 * Fetch user-specific conversations
 */
export const fetchUserConversations = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session when trying to fetch user conversations');
      throw new Error('Authentication required');
    }

    // Call our Supabase Edge Function to get user-specific conversations
    const { data, error } = await supabase.functions.invoke('get-user-conversations', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Error from get-user-conversations function:', error);
      throw error;
    }

    return data.conversations || [];
  } catch (error) {
    console.error('Exception fetching user conversations:', error);
    throw error;
  }
};

/**
 * Clear user conversation history
 */
export const clearUserConversations = async (conversationId?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session when trying to clear user conversations');
      throw new Error('Authentication required');
    }

    // If a specific conversation ID is provided, delete only that one
    if (conversationId) {
      const { error } = await supabase
        .from('user_conversations')
        .delete()
        .match({ 
          user_id: session.user.id,
          conversation_id: conversationId 
        });

      if (error) {
        console.error('Error deleting specific conversation:', error);
        throw error;
      }
      
      return true;
    } else {
      // Otherwise delete all conversations for the user
      const { error } = await supabase
        .from('user_conversations')
        .delete()
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting all user conversations:', error);
        throw error;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Exception clearing user conversations:', error);
    throw error;
  }
};

/**
 * Generate a cumulative summary from individual conversation summaries
 */
export const generateCumulativeSummary = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No active session when trying to generate cumulative summary');
      return null;
    }

    console.log('🧠 Fetching conversation summaries for cumulative summary generation');
    
    // Fetch all conversation summaries for the user
    const summaries = await fetchConversationSummaries();
    
    if (!summaries || summaries.length === 0) {
      console.log('🧠 No conversation summaries found, cannot generate cumulative summary');
      return null;
    }
    
    console.log(`🧠 Found ${summaries.length} summaries. Calling gemini-memory function to generate cumulative summary`);
    console.log('🧠 Summaries preview:', summaries.map(s => s.summary.substring(0, 50) + '...'));
    
    // Call the Gemini memory function to generate a cumulative summary
    console.log('🧠 Invoking gemini-memory function with action: generate, user ID:', session.user.id);
    const response = await supabase.functions.invoke('gemini-memory', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'generate',
        userId: session.user.id,
        summaries
      })
    });
    
    console.log('🧠 gemini-memory function response received:', response);
    
    if (response.error) {
      console.error('❌ Error calling gemini-memory function:', response.error);
      return null;
    }
    
    if (!response.data || !response.data.cumulativeSummary) {
      console.error('❌ Invalid response from gemini-memory function:', response.data);
      return null;
    }
    
    console.log('✅ Cumulative summary generated successfully');
    console.log('🧠 Summary preview:', response.data.cumulativeSummary.substring(0, 100) + '...');
    
    return response.data.cumulativeSummary;
  } catch (error) {
    console.error('❌ Exception generating cumulative summary:', error);
    return null;
  }
};

/**
 * Update the cumulative summary with a new conversation summary
 */
export const updateCumulativeSummary = async (newSummary: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No active session when trying to update cumulative summary');
      return null;
    }
    
    if (!newSummary) {
      console.error('❌ No new summary provided for update');
      return null;
    }

    console.log('🧠 Updating cumulative summary with new conversation information');
    console.log('🧠 New summary for integration:', newSummary.substring(0, 100) + '...');
    
    // Call the Gemini memory function to update the cumulative summary
    console.log('🧠 Invoking gemini-memory function with action: update, user ID:', session.user.id);
    const response = await supabase.functions.invoke('gemini-memory', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'update',
        userId: session.user.id,
        newSummary
      })
    });
    
    console.log('🧠 gemini-memory function update response received:', response);
    
    if (response.error) {
      console.error('❌ Error calling gemini-memory function for update:', response.error);
      return null;
    }
    
    if (!response.data || !response.data.cumulativeSummary) {
      console.error('❌ Invalid response from gemini-memory function for update:', response.data);
      return null;
    }
    
    console.log('✅ Cumulative summary updated successfully');
    console.log('🧠 Updated summary preview:', response.data.cumulativeSummary.substring(0, 100) + '...');
    
    return response.data.cumulativeSummary;
  } catch (error) {
    console.error('❌ Exception updating cumulative summary:', error);
    return null;
  }
};

/**
 * Retrieve the latest cumulative summary for a user
 */
export const retrieveCumulativeSummary = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No active session when trying to retrieve cumulative summary');
      return null;
    }

    console.log('🧠 Retrieving cumulative summary from database');
    console.log('🧠 User ID:', session.user.id);
    
    // Call the Gemini memory function to retrieve the cumulative summary
    const response = await supabase.functions.invoke('gemini-memory', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'retrieve',
        userId: session.user.id
      })
    });
    
    console.log('🧠 gemini-memory function retrieval response received:', response);
    
    if (response.error) {
      console.error('❌ Error calling gemini-memory function for retrieval:', response.error);
      return null;
    }
    
    if (!response.data) {
      console.error('❌ Invalid response from gemini-memory function for retrieval');
      return null;
    }
    
    if (!response.data.exists) {
      console.log('🧠 No cumulative summary exists yet for this user');
      return null;
    }
    
    console.log('✅ Cumulative summary retrieved successfully');
    console.log('🧠 Summary preview:', response.data.cumulativeSummary.substring(0, 100) + '...');
    console.log('🧠 Last updated at:', response.data.updatedAt);
    
    return response.data.cumulativeSummary;
  } catch (error) {
    console.error('❌ Exception retrieving cumulative summary:', error);
    return null;
  }
};

/**
 * Fetch conversation memory for a user
 * This will retrieve past conversations to build context
 */
export const fetchConversationMemory = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session when trying to fetch conversation memory');
      return null;
    }

    console.log('📝 Fetching conversation memory for user:', session.user.id);

    // Call our Supabase Edge Function to get conversation memory
    const { data, error } = await supabase.functions.invoke('get-conversation-memory', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Error from get-conversation-memory function:', error);
      return null;
    }

    if (data?.memory) {
      console.log('📚 Memory loaded successfully! Length:', data.memory.length);
      console.log('📚 Message count:', data.messageCount);
      console.log('📚 Summary count:', data.summaryCount);
      // Log a preview of the memory (first 100 characters)
      if (data.memory.length > 0) {
        console.log('📚 Memory preview:', data.memory.substring(0, 100) + '...');
      }
    } else {
      console.log('📚 No conversation memory found');
    }

    return data.memory || null;
  } catch (error) {
    console.error('Exception fetching conversation memory:', error);
    return null;
  }
};

/**
 * Fetch enhanced conversation memory with cumulative summary for better context
 * This combines the standard conversation memory with the AI-generated cumulative summary
 */
export const fetchEnhancedConversationMemory = async () => {
  try {
    console.log('🧠 Fetching enhanced conversation memory (with cumulative summary)');
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('❌ No active session when trying to retrieve enhanced memory');
      return null;
    }

    // Call our Supabase Edge Function to get conversation memory
    // The edge function now returns both the memory string and the cumulative summary
    const { data, error } = await supabase.functions.invoke('get-conversation-memory', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Error from get-conversation-memory function:', error);
      return null;
    }

    // Log detailed information about the returned memory
    console.log('Enhanced memory retrieval complete with the following stats:');
    console.log('- Message count:', data.messageCount || 0);
    console.log('- Summary count:', data.summaryCount || 0);
    console.log('- Has cumulative summary:', data.hasCumulativeMemory ? 'Yes' : 'No');
    
    if (data?.memory) {
      console.log('- Memory length:', data.memory.length);
      console.log('- Memory preview:', data.memory.substring(0, 200) + '...');
    }
    
    if (data?.cumulativeSummary) {
      console.log('- Cumulative summary found (direct field):', data.cumulativeSummary.substring(0, 100) + '...');
    }

    return data.memory || null;
  } catch (error) {
    console.error('Exception creating enhanced memory:', error);
    return null;
  }
};

/**
 * Store a conversation message in the memory database
 */
export const storeConversationMessage = async (
  conversationId: string, 
  source: 'user' | 'ai', 
  content: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when trying to store conversation message');
      return false;
    }

    console.log(`💾 Storing ${source} message: "${content.substring(0, 50)}..." for conversation ${conversationId}`);

    // Store the message in the conversation_messages table
    // Using the RPC function with explicit type casting to bypass TypeScript limitations
    const { error } = await (supabase.rpc as any)('insert_conversation_message', {
      p_user_id: user.id,
      p_conversation_id: conversationId,
      p_source: source,
      p_content: content
    });

    if (error) {
      console.error('Error storing conversation message:', error);
      
      // If the function doesn't exist, fallback to direct table insert
      if (error.code === "404") {
        console.log('Falling back to direct table insert...');
        const { error: insertError } = await supabase
          .from('conversation_messages')
          .insert({
            user_id: user.id,
            conversation_id: conversationId,
            source: source,
            content: content
          });
          
        if (insertError) {
          console.error('Error with direct insert fallback:', insertError);
          return false;
        }
        
        console.log('💾 Message stored successfully via fallback!');
        return true;
      }
      
      return false;
    }

    console.log('💾 Message stored successfully!');
    return true;
  } catch (error) {
    console.error('Exception storing conversation message:', error);
    return false;
  }
};

/**
 * Store a conversation summary in the database
 */
export const storeConversationSummary = async (
  conversationId: string,
  summary: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when trying to store conversation summary');
      return false;
    }

    console.log(`💾 SUMMARY STORAGE: Starting to store summary for conversation ${conversationId}`);
    console.log(`💾 SUMMARY CONTENT: "${summary.substring(0, 100)}..."`);

    // Get the session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session when trying to store conversation summary');
      return false;
    }

    // First try using the RPC function
    try {
      console.log('💾 SUMMARY STORAGE: Attempting to store via RPC function...');
      const { data, error } = await (supabase.rpc as any)('upsert_conversation_summary', {
        p_user_id: user.id,
        p_conversation_id: conversationId,
        p_summary: summary
      });

      if (error) {
        throw error;
      }
      
      console.log('💾 SUMMARY STORAGE: Successfully stored summary via RPC!', data);
      
      // Try to update the cumulative summary with this new summary
      try {
        console.log('💾 SUMMARY STORAGE: Updating cumulative summary with new conversation data');
        await updateCumulativeSummary(summary);
      } catch (summaryError) {
        console.error('Error updating cumulative summary, but summary was stored successfully:', summaryError);
        // Non-critical error, don't fail the whole operation
      }
      
      return true;
    } catch (rpcError) {
      console.warn('RPC error, falling back to direct insert:', rpcError);
      
      // Fall back to direct API call using upsert pattern
      try {
        console.log('💾 SUMMARY STORAGE: Attempting to store via direct upsert...');
        const { data, error } = await supabase
          .from('conversation_summaries')
          .upsert({
            user_id: user.id,
            conversation_id: conversationId,
            summary: summary
          }, {
            onConflict: 'conversation_id',
            ignoreDuplicates: false
          });
          
        if (error) {
          throw error;
        }
        
        console.log('💾 SUMMARY STORAGE: Successfully stored summary via direct upsert!', data);
        
        // Try to update the cumulative summary with this new summary
        try {
          console.log('💾 SUMMARY STORAGE: Updating cumulative summary with new conversation data');
          await updateCumulativeSummary(summary);
        } catch (summaryError) {
          console.error('Error updating cumulative summary, but summary was stored successfully:', summaryError);
          // Non-critical error, don't fail the whole operation
        }
        
        return true;
      } catch (directError) {
        console.error('Error with direct upsert:', directError);
        
        // Last resort: Try a raw REST API call
        try {
          console.log('💾 SUMMARY STORAGE: Attempting final fallback via REST API...');
          
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/conversation_summaries`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Prefer': 'resolution=merge-duplicates'  // This handles upsert logic
            },
            body: JSON.stringify({
              user_id: user.id,
              conversation_id: conversationId,
              summary: summary
            })
          });
          
          if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`API error: ${responseText}`);
          }
          
          console.log('💾 SUMMARY STORAGE: Successfully stored summary via API fallback!');
          
          // Try to update the cumulative summary with this new summary
          try {
            console.log('💾 SUMMARY STORAGE: Updating cumulative summary with new conversation data');
            await updateCumulativeSummary(summary);
          } catch (summaryError) {
            console.error('Error updating cumulative summary, but summary was stored successfully:', summaryError);
            // Non-critical error, don't fail the whole operation
          }
          
          return true;
        } catch (apiError) {
          console.error('Error with API fallback:', apiError);
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Exception storing conversation summary:', error);
    return false;
  }
};

/**
 * Fetch all conversation summaries for a user
 */
export const fetchConversationSummaries = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found when trying to fetch conversation summaries');
      return [];
    }

    console.log('📝 SUMMARY FETCH: Fetching conversation summaries for user:', user.id);

    // Direct query to get summaries
    const { data: summaries, error } = await supabase
      .from('conversation_summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversation summaries:', error);
      return [];
    }
    
    console.log(`📚 SUMMARY FETCH: Found ${summaries?.length || 0} conversation summaries`);
    if (summaries && summaries.length > 0) {
      console.log('📚 SUMMARY FETCH: First summary preview:', summaries[0].summary.substring(0, 100) + '...');
    }
    
    return summaries || [];
  } catch (error) {
    console.error('Exception fetching conversation summaries:', error);
    return [];
  }
};

/**
 * Fetches conversation details from ElevenLabs API
 * @param conversationId The ID of the conversation to fetch
 * @returns The conversation details
 */
export const fetchElevenLabsConversation = async (conversationId: string) => {
  try {
    // Use the environment variable for API key
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error("ElevenLabs API key is missing");
      return null;
    }
    
    const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
    
    console.log(`🔍 ELEVENLABS API: Fetching conversation details for ID: ${conversationId}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch conversation: ${response.status}`, errorText);
      return null;
    }
    
    const data = await response.json();
    
    // Log the full response structure for debugging
    console.log("🔎 ElevenLabs API response structure:", Object.keys(data));
    console.log("🔎 FULL RESPONSE (for debugging):", JSON.stringify(data, null, 2).substring(0, 500) + "...");
    
    // First log the available keys in the response for better visibility
    console.log("🔑 Available keys in response:", Object.keys(data).join(", "));
    
    if (data.data_collection_results) {
      console.log("🔑 Keys in data_collection_results:", Object.keys(data.data_collection_results).join(", "));
    }
    
    // IMPROVED SUMMARY EXTRACTION: Check multiple potential locations systematically
    let foundSummary = null;
    
    // 1. Check for direct summary field
    if (data.summary) {
      console.log("✅ FOUND: Direct summary field:", data.summary.substring(0, 100) + "...");
      foundSummary = data.summary;
    }
    // 2. Check for data_collection_results.summary (based on screenshot)
    else if (data.data_collection_results && data.data_collection_results.summary) {
      console.log("✅ FOUND: data_collection_results.summary field:", 
        data.data_collection_results.summary.substring(0, 100) + "...");
      foundSummary = data.data_collection_results.summary;
    }
    // 3. Check for transcript_summary field
    else if (data.transcript_summary) {
      console.log("✅ FOUND: transcript_summary field:", data.transcript_summary.substring(0, 100) + "...");
      foundSummary = data.transcript_summary;
    }
    // 4. Check for analysis.summary field
    else if (data.analysis && data.analysis.summary) {
      console.log("✅ FOUND: analysis.summary field:", data.analysis.summary.substring(0, 100) + "...");
      foundSummary = data.analysis.summary;
    }
    // 5. Check for evaluation_criteria_results.transcript_summary
    else if (data.evaluation_criteria_results && data.evaluation_criteria_results.transcript_summary) {
      console.log("✅ FOUND: evaluation_criteria_results.transcript_summary field:", 
        data.evaluation_criteria_results.transcript_summary.substring(0, 100) + "...");
      foundSummary = data.evaluation_criteria_results.transcript_summary;
    }
    
    // Search deeply in the response structure for any field that might contain a summary
    if (!foundSummary) {
      console.log("🔍 No direct summary field found. Searching deeper in the structure...");
      
      // Recursive function to search for summary fields in nested objects
      const findSummaryInObject = (obj: any, path = ''): string | null => {
        if (!obj || typeof obj !== 'object') return null;
        
        // Direct field matches to look for
        const summaryFieldNames = ['summary', 'transcript_summary'];
        
        for (const key of Object.keys(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          // Check if this is a direct summary field
          if (summaryFieldNames.includes(key.toLowerCase()) && typeof obj[key] === 'string' && obj[key].length > 20) {
            console.log(`✅ FOUND: Summary field at path ${currentPath}:`, obj[key].substring(0, 100) + "...");
            return obj[key];
          }
          
          // Handle special case for 'transcript_summary' fields which may not have been caught above
          if (key.includes('summary') && typeof obj[key] === 'string' && obj[key].length > 20) {
            console.log(`✅ FOUND: Potential summary field at path ${currentPath}:`, obj[key].substring(0, 100) + "...");
            return obj[key];
          }
          
          // Recursively check nested objects
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const nestedResult = findSummaryInObject(obj[key], currentPath);
            if (nestedResult) return nestedResult;
          }
        }
        
        return null;
      };
      
      // Use the recursive function to search the entire response
      foundSummary = findSummaryInObject(data);
    }
    
    if (!foundSummary) {
      console.log("⚠️ SUMMARY CHECK: All attempts failed. No summary could be extracted.");
      
      // Last-ditch effort: If there's a 'call_successful' and it contains a string message, use that
      if (data.call_successful === "success" && data.transcript_summary) {
        console.log("🔍 Using transcript_summary as fallback:", data.transcript_summary);
        foundSummary = data.transcript_summary;
      }
    }
    
    // If a summary was found, store it in the database
    if (foundSummary) {
      console.log("💾 SUMMARY SAVING: Found a valid summary, storing in database...");
      try {
        const stored = await storeConversationSummary(conversationId, foundSummary);
        if (stored) {
          console.log("✅ SUMMARY STORED SUCCESSFULLY in the database!");
        } else {
          console.error("❌ Failed to store summary in database");
        }
      } catch (error) {
        console.error("❌ Error storing summary:", error);
      }
      
      // Add the found summary to the data object before returning
      data.extracted_summary = foundSummary;
    } else {
      console.log("❌ SUMMARY CHECK: No summary found in any field of the response");
    }
    
    return data;
  } catch (error) {
    console.error("❌ Error fetching ElevenLabs conversation:", error);
    return null;
  }
};

// Deprecated - not used anymore as we're extracting summary directly
// from the conversation details
export const fetchAndStoreSummary = async (conversationId: string, summaryId: string, apiKey: string) => {
  console.log("⚠️ fetchAndStoreSummary is deprecated as we're now using direct summary extraction");
};
