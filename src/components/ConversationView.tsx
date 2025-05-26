  // import React, { useState, useEffect } from 'react';
  // import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  // import { Button } from '@/components/ui/button';
  // import { Play, Pause, Volume2, MessageSquare, User, Bot, Loader2, Info, RefreshCw } from 'lucide-react';
  // import { useStories } from '@/contexts/StoryContext';
  // import { toast } from 'sonner';
  // import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
  // import { Skeleton } from '@/components/ui/skeleton';
  // import { useIsMobile } from '@/hooks/use-mobile';

  // interface ConversationViewProps {
  //   storyId: string;
  //   open: boolean;
  //   onOpenChange: (open: boolean) => void;
  // }

  // interface ElevenLabsMessage {
  //   role: string;
  //   text: string;
  //   timestamp: string;
  // }

  // interface ElevenLabsTranscript {
  //   messages: ElevenLabsMessage[];
  // }

  // const ConversationView: React.FC<ConversationViewProps> = ({ storyId, open, onOpenChange }) => {
  //   const { getStoryById } = useStories();
  //   const story = getStoryById(storyId);
  //   const [isPlaying, setIsPlaying] = useState(false);
  //   const [currentTime, setCurrentTime] = useState(0);
  //   const [duration, setDuration] = useState(0);
  //   const audioRef = React.useRef<HTMLAudioElement | null>(null);
  //   const [volume, setVolume] = useState(1);
  //   const [isLoading, setIsLoading] = useState(false);
  //   const [isLoadingRemoteData, setIsLoadingRemoteData] = useState(false);
  //   const [showDebugInfo, setShowDebugInfo] = useState(false);
  //   const [elevenLabsAudioUrl, setElevenLabsAudioUrl] = useState<string | null>(null);
  //   const [elevenLabsTranscript, setElevenLabsTranscript] = useState<ElevenLabsMessage[] | null>(null);
  //   const [error, setError] = useState<string | null>(null);
  //   const isMobile = useIsMobile();
  
  //   const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  //   const conversation = story?.conversation || { 
  //     audioUrl: null, 
  //     messages: [],
  //     timestamp: null
  //   };

  //   const fetchElevenLabsData = async () => {
  //     if (!story?.elevenLabsConversationId) {
  //       setError("No ElevenLabs conversation ID available for this story.");
  //       return;
  //     }

  //     setIsLoadingRemoteData(true);
  //     setError(null);
      
  //     try {
  //       const transcriptResponse = await fetch(
  //         `https://api.elevenlabs.io/v1/convai/conversations/${story.elevenLabsConversationId}`, 
  //         {
  //           headers: {
  //             'xi-api-key': apiKey,
  //           }
  //         }
  //       );
        
  //       if (!transcriptResponse.ok) {
  //         throw new Error(`Failed to fetch transcript: ${transcriptResponse.statusText}`);
  //       }
        
  //       const transcriptData = await transcriptResponse.json();
  //       console.log("ElevenLabs transcript data:", transcriptData);
        
  //       if (transcriptData && transcriptData.conversation && transcriptData.conversation.messages) {
  //         setElevenLabsTranscript(transcriptData.conversation.messages);
  //       }
        
  //       const audioResponse = await fetch(
  //         `https://api.elevenlabs.io/v1/convai/conversations/${story.elevenLabsConversationId}/audio`,
  //         {
  //           headers: {
  //             'xi-api-key': apiKey,
  //           }
  //         }
  //       );
        
  //       if (!audioResponse.ok) {
  //         throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
  //       }
        
  //       const audioBlob = await audioResponse.blob();
  //       const url = URL.createObjectURL(audioBlob);
  //       setElevenLabsAudioUrl(url);
        
  //     } catch (error) {
  //       console.error("Error fetching ElevenLabs data:", error);
  //       setError(`Error fetching conversation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //       toast.error("Failed to load conversation data from ElevenLabs.");
  //     } finally {
  //       setIsLoadingRemoteData(false);
  //     }
  //   };

  //   useEffect(() => {
  //     if (open) {
  //       setCurrentTime(0);
  //       setIsPlaying(false);
        
  //       if (story?.elevenLabsConversationId) {
  //         fetchElevenLabsData();
  //       } else if (conversation.audioUrl) {
  //         setIsLoading(true);
  //       }
  //     }
  //   }, [open, story?.elevenLabsConversationId]);

  //   const handlePlayPause = () => {
  //     if (audioRef.current) {
  //       if (isPlaying) {
  //         audioRef.current.pause();
  //       } else {
  //         audioRef.current.play().catch(error => {
  //           console.error("Audio playback error:", error);
  //           toast.error("Audio playback failed. Please try again.");
  //         });
  //       }
  //       setIsPlaying(!isPlaying);
  //     }
  //   };

  //   const handleTimeUpdate = () => {
  //     if (audioRef.current) {
  //       setCurrentTime(audioRef.current.currentTime);
  //     }
  //   };

  //   const handleLoadedMetadata = () => {
  //     if (audioRef.current) {
  //       setDuration(audioRef.current.duration);
  //       setIsLoading(false);
  //     }
  //   };

  //   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const newVolume = parseFloat(e.target.value);
  //     setVolume(newVolume);
  //     if (audioRef.current) {
  //       audioRef.current.volume = newVolume;
  //     }
  //   };

  //   const formatTime = (time: number) => {
  //     const minutes = Math.floor(time / 60);
  //     const seconds = Math.floor(time % 60);
  //     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  //   };

  //   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const seekTime = parseFloat(e.target.value);
  //     if (audioRef.current) {
  //       audioRef.current.currentTime = seekTime;
  //       setCurrentTime(seekTime);
  //     }
  //   };

  //   const hasAudio = Boolean(conversation?.audioUrl) || Boolean(elevenLabsAudioUrl);
  //   const hasMessages = Boolean(conversation?.messages?.length > 0) || Boolean(elevenLabsTranscript?.length);
  //   const audioSource = elevenLabsAudioUrl || conversation?.audioUrl;
  //   const effectiveMessages = elevenLabsTranscript 
  //     ? elevenLabsTranscript.map(msg => ({
  //         role: msg.role === 'assistant' ? 'ai' : 'user' as 'ai' | 'user',
  //         content: msg.text,
  //         timestamp: msg.timestamp
  //       }))
  //     : conversation?.messages || [];

  //   useEffect(() => {
  //     if (open && !hasAudio && !hasMessages && !isLoadingRemoteData) {
  //       toast.info("No conversation data available for this story. Try practicing with it first to generate a conversation.");
  //     }
  //   }, [open, hasAudio, hasMessages, isLoadingRemoteData]);

  //   const dialogWidthClasses = isMobile 
  //     ? "w-[95vw] max-w-[95vw] p-3" 
  //     : "max-w-3xl w-[90vw]";

  //   const scrollAreaHeightClass = isMobile ? "h-[50vh]" : "h-[40vh]";

  //   const messageWidthClass = isMobile ? "max-w-[95%]" : "max-w-[80%]";

  //   return (
  //     <Dialog open={open} onOpenChange={onOpenChange}>
  //       <DialogContent className={`${dialogWidthClasses} overflow-hidden flex flex-col`}>
  //         <DialogHeader className={`border-b ${isMobile ? 'pb-2' : 'pb-4'}`}>
  //           <DialogTitle className="text-xl flex items-center justify-between flex-wrap gap-2">
  //             <div className="flex items-center">
  //               <MessageSquare className="mr-2 h-5 w-5" />
  //               <span className="truncate">{story?.title || 'Conversation'} Transcript</span>
  //             </div>
  //             <div className="flex gap-2">
  //               {story?.elevenLabsConversationId && (
  //                 <Button 
  //                   size={isMobile ? "sm" : "default"}
  //                   variant="outline" 
  //                   className={`${isMobile ? 'h-7 px-1.5 text-xs' : 'h-8 px-2'}`}
  //                   onClick={fetchElevenLabsData}
  //                   disabled={isLoadingRemoteData}
  //                 >
  //                   {isLoadingRemoteData ? <Loader2 size={16} className="animate-spin mr-1" /> : <RefreshCw size={16} className="mr-1" />}
  //                   {isMobile ? '' : 'Refresh'}
  //                 </Button>
  //               )}
  //               <Sheet>
  //                 <SheetTrigger asChild>
  //                   <Button
  //                     size={isMobile ? "sm" : "default"}
  //                     variant="ghost"
  //                     onClick={() => setShowDebugInfo(!showDebugInfo)}
  //                     className={`${isMobile ? 'h-7 px-1.5' : 'h-8 px-2'}`}
  //                   >
  //                     <Info size={16} className="text-muted-foreground" />
  //                   </Button>
  //                 </SheetTrigger>
  //                 <SheetContent className={isMobile ? "w-[90vw]" : ""}>
  //                   <SheetHeader>
  //                     <SheetTitle>Conversation Debug Info</SheetTitle>
  //                   </SheetHeader>
  //                   <div className="py-4 text-sm">
  //                     <p className="font-medium text-muted-foreground mb-2">Story ID: {storyId}</p>
  //                     <p className="font-medium mb-2">ElevenLabs Conversation ID: {story?.elevenLabsConversationId || "Not available"}</p>
  //                     <p className="font-medium mb-2">Local Audio URL: {conversation.audioUrl ? "Available" : "Not available"}</p>
  //                     <p className="font-medium mb-2">ElevenLabs Audio URL: {elevenLabsAudioUrl ? "Available" : "Not available"}</p>
  //                     <p className="font-medium mb-2">Local Messages: {conversation.messages?.length || 0}</p>
  //                     <p className="font-medium mb-2">ElevenLabs Transcript Messages: {elevenLabsTranscript?.length || 0}</p>
  //                     <p className="font-medium mb-2">Timestamp: {conversation.timestamp ? new Date(conversation.timestamp).toLocaleString() : "None"}</p>
                      
  //                     <div className="mt-4 p-4 bg-muted/30 rounded-md">
  //                       <p className="font-medium mb-2">Raw Story Data:</p>
  //                       <pre className="text-xs overflow-auto max-h-[400px] p-2 bg-background rounded">
  //                         {JSON.stringify(story, null, 2)}
  //                       </pre>
  //                     </div>
  //                   </div>
  //                 </SheetContent>
  //               </Sheet>
  //             </div>
  //           </DialogTitle>
  //         </DialogHeader>
          
  //         <Tabs defaultValue={hasMessages ? "text" : "audio"} className="w-full flex-1 overflow-hidden flex flex-col">
  //           <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-2' : 'mb-4'}`}>
  //             <TabsTrigger value="audio" className="flex items-center text-xs sm:text-sm">
  //               <Volume2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
  //               Voice {hasAudio ? "" : "(Empty)"}
  //             </TabsTrigger>
  //             <TabsTrigger value="text" className="flex items-center text-xs sm:text-sm">
  //               <MessageSquare className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
  //               Transcript {hasMessages ? "" : "(Empty)"}
  //             </TabsTrigger>
  //           </TabsList>
            
  //           <TabsContent value="audio" className={`${isMobile ? 'py-2' : 'py-4'} flex-1 overflow-auto`}>
  //             <div className={`bg-card rounded-md border ${isMobile ? 'p-3' : 'p-6'} shadow-sm`}>
  //               {error && (
  //                 <div className="p-3 mb-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
  //                   {error}
  //                 </div>
  //               )}
  //               <div className="flex items-center space-x-3">
  //                 <Button 
  //                   variant="outline" 
  //                   size="icon" 
  //                   onClick={handlePlayPause}
  //                   className={`${isMobile ? 'h-10 w-10' : 'h-14 w-14'} rounded-full`}
  //                   disabled={!audioSource || isLoading || isLoadingRemoteData}
  //                 >
  //                   {(isLoading || isLoadingRemoteData) ? (
  //                     <Loader2 size={isMobile ? 18 : 24} className="animate-spin" />
  //                   ) : isPlaying ? (
  //                     <Pause size={isMobile ? 18 : 24} />
  //                   ) : (
  //                     <Play size={isMobile ? 18 : 24} />
  //                   )}
  //                 </Button>
                  
  //                 <div className="flex-1 space-y-1 sm:space-y-2">
  //                   <div className="flex items-center">
  //                     <input
  //                       type="range"
  //                       min="0"
  //                       max={duration || 1}
  //                       step="0.01"
  //                       value={currentTime}
  //                       onChange={handleSeek}
  //                       className="w-full h-1.5 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer"
  //                       disabled={!audioSource || isLoading || isLoadingRemoteData}
  //                     />
  //                   </div>
                    
  //                   <div className="flex justify-between text-xs text-muted-foreground">
  //                     <span>{formatTime(currentTime)}</span>
  //                     <span>{formatTime(duration || 0)}</span>
  //                   </div>
  //                 </div>
  //               </div>
                
  //               <div className="mt-3 sm:mt-4 flex items-center space-x-2 px-1 sm:px-2">
  //                 <Volume2 size={isMobile ? 14 : 18} className="text-muted-foreground" />
  //                 <input
  //                   type="range"
  //                   min="0"
  //                   max="1"
  //                   step="0.01"
  //                   value={volume}
  //                   onChange={handleVolumeChange}
  //                   className={`w-20 sm:w-24 h-1 sm:h-1.5 bg-muted rounded-lg appearance-none cursor-pointer`}
  //                   disabled={!audioSource || isLoading || isLoadingRemoteData}
  //                 />
  //               </div>
                
  //               <div className="mt-4 sm:mt-6">
  //                 {audioSource ? (
  //                   <audio 
  //                     ref={audioRef} 
  //                     src={audioSource} 
  //                     onTimeUpdate={handleTimeUpdate}
  //                     onLoadedMetadata={handleLoadedMetadata}
  //                     onEnded={() => setIsPlaying(false)}
  //                     onError={() => {
  //                       setIsLoading(false);
  //                       toast.error("Failed to load audio. The URL might be invalid or expired.");
  //                     }}
  //                   />
  //                 ) : isLoadingRemoteData ? (
  //                   <div className="p-6 bg-accent/10 rounded-lg text-center">
  //                     <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
  //                     <p>Loading conversation audio from ElevenLabs...</p>
  //                   </div>
  //                 ) : (
  //                   <div className="p-6 bg-accent/10 rounded-lg text-center">
  //                     <p className="font-medium mb-2">Audio recording not available</p>
  //                     <p>Start a conversation with the AI coach to generate an audio recording of your interview practice.</p>
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //           </TabsContent>
            
  //           <TabsContent value="text" className="flex-1 overflow-auto pr-1 sm:pr-2">
  //             <div className="space-y-2 sm:space-y-4 py-2">
  //               {(isLoading || isLoadingRemoteData) ? (
  //                 Array(3).fill(0).map((_, index) => (
  //                   <div key={index} className={`p-3 sm:p-4 rounded-lg border ${index % 2 === 0 ? 'ml-2 sm:ml-4' : 'mr-2 sm:mr-4'}`}>
  //                     <div className="flex items-center mb-2">
  //                       <Skeleton className="w-6 sm:w-8 h-6 sm:h-8 rounded-full mr-2" />
  //                       <Skeleton className="w-24 sm:w-32 h-4 sm:h-5" />
  //                       <div className="ml-auto">
  //                         <Skeleton className="w-12 sm:w-16 h-3 sm:h-4" />
  //                       </div>
  //                     </div>
  //                     <Skeleton className="h-3 sm:h-4 w-full mb-1" />
  //                     <Skeleton className="h-3 sm:h-4 w-3/4" />
  //                   </div>
  //                 ))
  //               ) : error ? (
  //                 <div className="p-3 sm:p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
  //                   {error}
  //                 </div>
  //               ) : effectiveMessages.length > 0 ? (
  //                 effectiveMessages.map((message: any, index: number) => (
  //                   <div 
  //                     key={index} 
  //                     className={`p-3 sm:p-4 rounded-lg ${
  //                       message.role === 'ai' 
  //                         ? 'bg-accent/20 border border-accent/20 ml-2 sm:ml-4' 
  //                         : 'bg-primary/10 border border-primary/10 mr-2 sm:mr-4'
  //                     }`}
  //                   >
  //                     <div className="flex items-center mb-1 sm:mb-2">
  //                       <div className={`rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-1 sm:mr-2 
  //                         ${message.role === 'ai' 
  //                           ? 'bg-accent text-accent-foreground' 
  //                           : 'bg-primary text-primary-foreground'
  //                         }`}
  //                       >
  //                         {message.role === 'ai' ? <Bot size={isMobile ? 14 : 16} /> : <User size={isMobile ? 14 : 16} />}
  //                       </div>
  //                       <div className="font-medium text-sm sm:text-base">
  //                         {message.role === 'ai' ? 'Interview Coach' : 'You'}
  //                       </div>
  //                       <div className="text-xs text-muted-foreground ml-auto">
  //                         {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
  //                           hour: '2-digit',
  //                           minute: '2-digit'
  //                         }) : conversation.timestamp ? new Date(conversation.timestamp).toLocaleTimeString([], {
  //                           hour: '2-digit',
  //                           minute: '2-digit'
  //                         }) : new Date().toLocaleTimeString([], {
  //                           hour: '2-digit',
  //                           minute: '2-digit'
  //                         })}
  //                       </div>
  //                     </div>
  //                     <p className={`${isMobile ? 'text-sm pl-7' : 'pl-10'} whitespace-pre-wrap`}>{message.content}</p>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <div className="text-center py-8 sm:py-12 bg-muted/20 rounded-lg">
  //                   <MessageSquare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-50" />
  //                   <p className="font-medium">No conversation transcript available yet.</p>
  //                   <p className="text-sm mt-1 text-muted-foreground">
  //                     Start a conversation to see the transcript here.
  //                   </p>
  //                 </div>
  //               )}
  //             </div>
  //           </TabsContent>
  //         </Tabs>
  //       </DialogContent>
  //     </Dialog>
  //   );
  // };

  // export default ConversationView;
 
  import React, { useState, useEffect } from 'react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Button } from '@/components/ui/button';
  import { Play, Pause, Volume2, MessageSquare, User, Bot, Loader2, Info, RefreshCw } from 'lucide-react';
  import { useStories } from '@/contexts/StoryContext';
  import { toast } from 'sonner';
  import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
  import { Skeleton } from '@/components/ui/skeleton';
  import { useIsMobile } from '@/hooks/use-mobile';

  interface ConversationViewProps {
    storyId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  interface ElevenLabsMessage {
    role: string; // 'user' or 'assistant' typically
    text: string;
    timestamp: string;
  }

  // Assuming the API returns an object that nests the conversation
  interface ElevenLabsConversationApiResponse {
    conversation_id: string;
    // ... other conversation metadata
    conversation: {
        messages: ElevenLabsMessage[];
        // ... other nested conversation details
    };
  }


  const ConversationView: React.FC<ConversationViewProps> = ({ storyId, open, onOpenChange }) => {
    const { getStoryById } = useStories();
    const story = getStoryById(storyId);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false); // For local audio loading
    const [isLoadingRemoteData, setIsLoadingRemoteData] = useState(false); // For ElevenLabs API calls
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [elevenLabsAudioUrl, setElevenLabsAudioUrl] = useState<string | null>(null);
    const [elevenLabsTranscript, setElevenLabsTranscript] = useState<ElevenLabsMessage[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isMobile = useIsMobile();
  
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

    const conversation = story?.conversation || { 
      audioUrl: null, 
      messages: [],
      timestamp: null
    };

    const fetchElevenLabsData = async () => {
      if (!story?.elevenLabsConversationId) {
        setError("No ElevenLabs conversation ID available for this story.");
        // Do not proceed if there's no ID
        return;
      }

      setIsLoadingRemoteData(true);
      setError(null);
      setElevenLabsAudioUrl(null); // Reset previous data
      setElevenLabsTranscript(null); // Reset previous data
      
      try {
        // Fetching the specific conversation transcript using its ID
        const transcriptResponse = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${story.elevenLabsConversationId}`, 
          {
            headers: {
              'xi-api-key': apiKey,
            }
          }
        );
        
        if (!transcriptResponse.ok) {
          const errorData = await transcriptResponse.json().catch(() => ({ detail: transcriptResponse.statusText }));
          throw new Error(`Failed to fetch transcript (${transcriptResponse.status}): ${errorData.detail || transcriptResponse.statusText}`);
        }
        
        const transcriptData: ElevenLabsConversationApiResponse = await transcriptResponse.json();
        console.log("ElevenLabs transcript data:", transcriptData);
        
        // The API returns a nested structure, common for single resource GET
        if (transcriptData && transcriptData.conversation && transcriptData.conversation.messages) {
          setElevenLabsTranscript(transcriptData.conversation.messages);
        } else {
            // Handle cases where the expected structure isn't found, even with a 200 OK
            console.warn("Transcript data received, but messages structure not found:", transcriptData);
            setElevenLabsTranscript([]); // Set to empty array to indicate data was fetched but no messages
        }
        
        // Fetching the audio for the specific conversation using its ID
        const audioResponse = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversations/${story.elevenLabsConversationId}/audio`,
          {
            headers: {
              'xi-api-key': apiKey,
            }
          }
        );
        
        if (!audioResponse.ok) {
          const errorData = await audioResponse.json().catch(() => ({ detail: audioResponse.statusText }));
          throw new Error(`Failed to fetch audio (${audioResponse.status}): ${errorData.detail || audioResponse.statusText}`);
        }
        
        const audioBlob = await audioResponse.blob();
        if (audioBlob.size === 0) {
            // Handle empty audio blob, which might mean no audio was generated
            console.warn("Fetched audio blob is empty for conversation ID:", story.elevenLabsConversationId);
            setElevenLabsAudioUrl(null); // Or set a specific state to indicate no audio
            toast.info("No audio content found for this conversation on ElevenLabs.");
        } else {
            const url = URL.createObjectURL(audioBlob);
            setElevenLabsAudioUrl(url);
        }
        
      } catch (error) {
        console.error("Error fetching ElevenLabs data:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while fetching conversation data.';
        setError(`Error: ${errorMessage}`);
        toast.error("Failed to load conversation data from ElevenLabs.");
      } finally {
        setIsLoadingRemoteData(false);
      }
    };

    useEffect(() => {
      if (open) {
        setCurrentTime(0);
        setIsPlaying(false);
        setError(null); // Clear previous errors
        
        // Clear previous ElevenLabs data when dialog opens for a new story or re-opens
        setElevenLabsAudioUrl(null);
        setElevenLabsTranscript(null);

        if (story?.elevenLabsConversationId) {
          fetchElevenLabsData();
        } else if (conversation.audioUrl) { // Fallback to local data if no ElevenLabs ID
          setIsLoading(true); // For local audio player
        } else {
          // No ElevenLabs ID and no local audio URL
           if (!isLoadingRemoteData && !story?.elevenLabsConversationId) { // Avoid toast if already loading or about to load
            setError("No conversation data available for this story. Try practicing to generate one.");
           }
        }
      } else {
        // Cleanup when dialog closes
        if (audioRef.current && elevenLabsAudioUrl) {
          // Revoke object URL to free up memory if it was created from a blob
           URL.revokeObjectURL(elevenLabsAudioUrl);
           setElevenLabsAudioUrl(null);
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, story?.elevenLabsConversationId, storyId]); // Added storyId to re-fetch if it changes while open (though less common for dialogs)


    // Effect to handle audio source changes for the <audio> element
    useEffect(() => {
        const audioEl = audioRef.current;
        if (audioEl) {
            if (elevenLabsAudioUrl) {
                audioEl.src = elevenLabsAudioUrl;
                // Reset states for new audio source
                setCurrentTime(0);
                setDuration(0);
                setIsPlaying(false);
                setIsLoading(true); // Indicate that the new audio source is loading
            } else if (conversation.audioUrl) {
                audioEl.src = conversation.audioUrl;
                setCurrentTime(0);
                setDuration(0);
                setIsPlaying(false);
                setIsLoading(true);
            } else {
                audioEl.removeAttribute('src');
                setIsLoading(false);
            }
        }
    }, [elevenLabsAudioUrl, conversation.audioUrl]);


    const handlePlayPause = () => {
      if (audioRef.current && (elevenLabsAudioUrl || conversation.audioUrl)) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(error => {
            console.error("Audio playback error:", error);
            toast.error("Audio playback failed. Please try again.");
            setIsPlaying(false); // Ensure state is correct on error
          });
        }
        setIsPlaying(!isPlaying);
      }
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        setIsLoading(false); // Audio metadata loaded, no longer "loading"
      }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(duration); // Or audioRef.current.duration
    };
    
    const handleAudioError = () => {
        setIsLoading(false);
        setIsPlaying(false);
        setError("Failed to load audio. The URL might be invalid, expired, or the format not supported.");
        toast.error("Failed to load audio.");
    };


    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    };

    const formatTime = (time: number) => {
      if (isNaN(time) || time === Infinity) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const seekTime = parseFloat(e.target.value);
      if (audioRef.current) {
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
      }
    };

    // Determine if any audio source is available
    const audioSourceForPlayer = elevenLabsAudioUrl || conversation?.audioUrl;
    const hasAudio = Boolean(audioSourceForPlayer);
    
    // Determine effective messages, prioritizing ElevenLabs transcript
    const effectiveMessages = elevenLabsTranscript 
      ? elevenLabsTranscript.map(msg => ({
          role: msg.role === 'assistant' ? 'ai' : 'user' as 'ai' | 'user', // Normalize role
          content: msg.text,
          timestamp: msg.timestamp // Use ElevenLabs timestamp
        }))
      : conversation?.messages?.map(msg => ({ // Fallback to local messages
            ...msg, 
            timestamp: conversation.timestamp // Use main conversation timestamp if message has no individual one
        })) || [];
    
    const hasMessages = effectiveMessages.length > 0;

    useEffect(() => {
      // This toast is for when no data source is even attempted (e.g., no elevenLabsId and no local audio)
      // It should only show if not loading and dialog is open.
      if (open && !hasAudio && !hasMessages && !isLoadingRemoteData && !isLoading && !story?.elevenLabsConversationId && !conversation.audioUrl && !error) {
        // Delay toast slightly to allow initial fetch/load to complete
        const timer = setTimeout(() => {
            if (open && !hasAudio && !hasMessages && !isLoadingRemoteData && !isLoading && !error) {
                 toast.info("No conversation data available for this story. Try practicing with it first to generate a conversation.");
            }
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [open, hasAudio, hasMessages, isLoadingRemoteData, isLoading, story?.elevenLabsConversationId, conversation.audioUrl, error]);

    const dialogWidthClasses = isMobile 
      ? "w-[95vw] max-w-[95vw] p-3" 
      : "max-w-3xl w-[90vw]";

    // const scrollAreaHeightClass = isMobile ? "h-[50vh]" : "h-[40vh]";
    // const messageWidthClass = isMobile ? "max-w-[95%]" : "max-w-[80%]"; // This was defined but not used, consider applying or removing

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={`${dialogWidthClasses} overflow-hidden flex flex-col`}>
          <DialogHeader className={`border-b ${isMobile ? 'pb-2' : 'pb-4'}`}>
            <DialogTitle className="text-xl flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center min-w-0"> {/* Added min-w-0 for better truncation */}
                <MessageSquare className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{story?.title || 'Conversation'} Transcript</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {story?.elevenLabsConversationId && (
                  <Button 
                    size={isMobile ? "sm" : "default"}
                    variant="outline" 
                    className={`${isMobile ? 'h-7 px-1.5 text-xs' : 'h-8 px-2'}`}
                    onClick={fetchElevenLabsData}
                    disabled={isLoadingRemoteData}
                    title="Refresh from ElevenLabs"
                  >
                    {isLoadingRemoteData ? <Loader2 size={16} className="animate-spin mr-1" /> : <RefreshCw size={16} className="mr-1" />}
                    {isMobile ? '' : 'Refresh'}
                  </Button>
                )}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size={isMobile ? "sm" : "default"}
                      variant="ghost"
                      onClick={() => setShowDebugInfo(!showDebugInfo)} // Toggle is fine, Sheet handles its own open state via trigger
                      className={`${isMobile ? 'h-7 px-1.5' : 'h-8 px-2'}`}
                      title="Show Debug Info"
                    >
                      <Info size={16} className="text-muted-foreground" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className={isMobile ? "w-[90vw]" : ""}>
                    <SheetHeader>
                      <SheetTitle>Conversation Debug Info</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 text-sm space-y-1">
                      <p><span className="font-medium text-muted-foreground">Story ID:</span> {storyId}</p>
                      <p><span className="font-medium text-muted-foreground">ElevenLabs Conv ID:</span> {story?.elevenLabsConversationId || "Not available"}</p>
                      <p><span className="font-medium text-muted-foreground">Local Audio:</span> {conversation.audioUrl ? "Available" : "Not available"}</p>
                      <p><span className="font-medium text-muted-foreground">ElevenLabs Audio:</span> {elevenLabsAudioUrl ? "Available" : "Not available"}</p>
                      <p><span className="font-medium text-muted-foreground">Local Msgs:</span> {conversation.messages?.length || 0}</p>
                      <p><span className="font-medium text-muted-foreground">ElevenLabs Msgs:</span> {elevenLabsTranscript?.length || 0}</p>
                      <p><span className="font-medium text-muted-foreground">Local Timestamp:</span> {conversation.timestamp ? new Date(conversation.timestamp).toLocaleString() : "None"}</p>
                      
                      <div className="mt-4 pt-4 border-t">
                        <p className="font-medium mb-2">Raw Story Data (Context):</p>
                        <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-muted/50 rounded">
                          {JSON.stringify(story, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue={hasMessages || (!hasAudio && hasMessages) ? "text" : "audio"} className="w-full flex-1 overflow-hidden flex flex-col">
            <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <TabsTrigger value="audio" className="flex items-center text-xs sm:text-sm" disabled={!hasAudio && !isLoadingRemoteData && !isLoading}>
                <Volume2 className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Voice {!hasAudio && !isLoadingRemoteData && !isLoading ? "(Empty)" : ""}
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center text-xs sm:text-sm" disabled={!hasMessages && !isLoadingRemoteData}>
                <MessageSquare className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Transcript {!hasMessages && !isLoadingRemoteData ? "(Empty)" : ""}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="audio" className={`${isMobile ? 'py-2' : 'py-4'} flex-1 overflow-auto`}>
              <div className={`bg-card rounded-md border ${isMobile ? 'p-3' : 'p-6'} shadow-sm`}>
                {error && !elevenLabsAudioUrl && ( // Show general error if audio URL isn't set yet from remote
                  <div className="p-3 mb-3 border border-red-200 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePlayPause}
                    className={`${isMobile ? 'h-10 w-10' : 'h-14 w-14'} rounded-full`}
                    disabled={!audioSourceForPlayer || isLoading || isLoadingRemoteData}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {(isLoading || (isLoadingRemoteData && !audioSourceForPlayer)) ? ( // Show loader if general loading or remote data is loading and no audio yet
                      <Loader2 size={isMobile ? 18 : 24} className="animate-spin" />
                    ) : isPlaying ? (
                      <Pause size={isMobile ? 18 : 24} />
                    ) : (
                      <Play size={isMobile ? 18 : 24} />
                    )}
                  </Button>
                  
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 1} // Ensure max is at least 1 to prevent issues if duration is 0
                      step="0.01"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!audioSourceForPlayer || isLoading || isLoadingRemoteData || duration === 0}
                      aria-label="Audio seek bar"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 flex items-center space-x-2 px-1 sm:px-2">
                  <Volume2 size={isMobile ? 14 : 18} className="text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className={`w-20 sm:w-24 h-1 sm:h-1.5 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={!audioSourceForPlayer || isLoading || isLoadingRemoteData}
                    aria-label="Volume control"
                  />
                </div>
                
                {/* Hidden audio element */}
                <audio 
                    ref={audioRef} 
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleAudioEnded}
                    onError={handleAudioError}
                    onCanPlay={() => setIsLoading(false)} // Another way to detect loading finished
                    onWaiting={() => setIsLoading(true)} // When buffering/waiting
                    className="hidden"
                />

                {!audioSourceForPlayer && !isLoadingRemoteData && !isLoading && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-muted/20 rounded-lg text-center">
                        <Volume2 className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-30" />
                        <p className="font-medium mb-1">Audio Not Available</p>
                        <p className="text-sm text-muted-foreground">
                            {story?.elevenLabsConversationId 
                                ? "Could not load audio from ElevenLabs."
                                : "No audio recording for this conversation yet."}
                        </p>
                         {error && audioSourceForPlayer && ( // Show specific audio error if an attempt was made
                            <p className="text-xs text-red-600 mt-2">{error}</p>
                         )}
                    </div>
                )}
                 {isLoadingRemoteData && !audioSourceForPlayer && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-muted/20 rounded-lg text-center">
                      <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">Loading audio from ElevenLabs...</p>
                    </div>
                 )}

              </div>
            </TabsContent>
            
            <TabsContent value="text" className="flex-1 overflow-auto pr-1 sm:pr-2">
              <div className="space-y-2 sm:space-y-4 py-2">
                {(isLoadingRemoteData && !elevenLabsTranscript) ? ( // Show skeleton only if loading and no transcript yet
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className={`p-3 sm:p-4 rounded-lg border ${index % 2 === 0 ? 'ml-auto w-[90%] sm:w-[80%]' : 'mr-auto w-[90%] sm:w-[80%]'}`}>
                      <div className="flex items-center mb-2">
                        <Skeleton className="w-6 sm:w-8 h-6 sm:h-8 rounded-full mr-2 flex-shrink-0" />
                        <Skeleton className="w-24 sm:w-32 h-4 sm:h-5" />
                        <div className="ml-auto">
                          <Skeleton className="w-12 sm:w-16 h-3 sm:h-4" />
                        </div>
                      </div>
                      <Skeleton className="h-3 sm:h-4 w-full mb-1" />
                      <Skeleton className="h-3 sm:h-4 w-3/4" />
                    </div>
                  ))
                ) : error && !elevenLabsTranscript ? ( // Show general error if transcript isn't set yet from remote
                  <div className="p-3 sm:p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
                    {error}
                  </div>
                ) : effectiveMessages.length > 0 ? (
                  effectiveMessages.map((message, index) => (
                    <div 
                      key={index} 
                      className={`p-3 sm:p-4 rounded-lg border ${
                        message.role === 'ai' 
                          ? 'bg-accent/20 border-accent/30 ml-auto w-[90%] sm:w-[80%]' // AI messages on the right
                          : 'bg-primary/10 border-primary/20 mr-auto w-[90%] sm:w-[80%]' // User messages on the left
                      }`}
                    >
                      <div className="flex items-center mb-1 sm:mb-2">
                        <div className={`rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-1.5 sm:mr-2 flex-shrink-0
                          ${message.role === 'ai' 
                            ? 'bg-accent text-accent-foreground' 
                            : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {message.role === 'ai' ? <Bot size={isMobile ? 14 : 16} /> : <User size={isMobile ? 14 : 16} />}
                        </div>
                        <div className="font-medium text-sm sm:text-base">
                          {message.role === 'ai' ? 'Interview Coach' : 'You'}
                        </div>
                        {message.timestamp && (
                            <div className="text-xs text-muted-foreground ml-auto pl-2">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            </div>
                        )}
                      </div>
                      <p className={`${isMobile ? 'text-sm pl-[calc(1.5rem+0.375rem)]' : 'pl-[calc(2rem+0.5rem)]'} whitespace-pre-wrap break-words`}>{message.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-muted/20 rounded-lg">
                    <MessageSquare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 opacity-30" />
                    <p className="font-medium">No transcript available.</p>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {story?.elevenLabsConversationId 
                        ? "Could not load transcript from ElevenLabs or it's empty."
                        : "Start a conversation to see the transcript here."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  export default ConversationView;