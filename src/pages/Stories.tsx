import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertTriangle, Book, CheckCircle, XCircle, Play, Pause, Volume2, Eye } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from '@/hooks/use-mobile';
import { fetchUserConversations } from '@/utils/elevenlabsHelper';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to check if API key is available
const getApiKey = () => {
  const DANGEROUS_API_KEY = 'sk_d606a16d35671cfcb347ab94ca2d304b6fb9333cd570293f';
  return DANGEROUS_API_KEY || '';
};

interface ElevenLabsConversationStub {
  agent_id?: string;
  agent_name?: string;
  call_duration_secs?: number;
  call_successful?: string;
  conversation_id: string;
  message_count?: number;
  start_time_unix_secs?: number;
  status?: string;
  transcript?: ElevenLabsMessage[];
  [key: string]: any;
}

interface ElevenLabsConversationsResponse {
    conversations: ElevenLabsConversationStub[];
}

interface ElevenLabsMessage {
  role: 'user' | 'agent';
  message: string;
  time_in_call_secs?: number;
  author?: 'user' | 'agent';
  text?: string;
  timestamp_unix_secs?: number;
}

interface ElevenLabsConversationDetail extends ElevenLabsConversationStub {
  messages: ElevenLabsMessage[];
}

interface ConversationLogCardProps {
  log: ElevenLabsConversationStub;
  apiKey: string;
  onViewDetails: (id: string) => void;
}

const formatTimestamp = (unixSeconds?: number): string => {
  if (unixSeconds === undefined || unixSeconds === null) return 'N/A';
  try {
    return new Date(unixSeconds * 1000).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short'
    });
  } catch (e) {
    console.error("Error formatting timestamp:", e);
    return 'Invalid Date';
  }
};

const formatDuration = (seconds?: number): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
}

const ConversationLogCard: React.FC<ConversationLogCardProps> = ({ log, apiKey, onViewDetails }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFetchingAudio, setIsFetchingAudio] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const getStatusBadge = (status?: string, successful?: string) => {
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        let text = status || 'Unknown';
        let Icon = null;

        if (status === 'done') {
            if (successful === 'success') {
                variant = "default";
                text = "Success";
                Icon = CheckCircle;
            } else {
                variant = "destructive";
                text = `Ended (${status || 'status unknown'})`;
                Icon = XCircle;
            }
        } else if (status === 'in_progress') {
             variant = "outline";
             text = "In Progress";
             Icon = Loader2;
        } else if (status === 'failed') {
             variant = "destructive";
             text = "Failed";
             Icon = XCircle;
        }

        return (
            <Badge variant={variant} className="flex items-center gap-1">
                {Icon && <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />}
                {text}
            </Badge>
        );
    }

    const fetchAudio = async () => {
      if (!apiKey) {
          setFetchError("API Key is missing. Cannot fetch audio.");
          console.error("FATAL: API Key missing in ConversationLogCard.");
          toast.error("Configuration error: API Key missing.");
          return;
      }
      if (!log.conversation_id) {
          setFetchError("Conversation ID is missing.");
          return;
      }

      setIsFetchingAudio(true);
      setFetchError(null);
      const url = `https://api.elevenlabs.io/v1/convai/conversations/${log.conversation_id}/audio`;

      try {
          const response = await fetch(url, { method: 'GET', headers: { 'xi-api-key': apiKey } });
          if (!response.ok) {
               let errorBody = `Status: ${response.status}`;
               try {
                   const errorData = await response.json();
                   if (errorData?.detail?.message) errorBody = `${errorBody} - ${errorData.detail.message}`;
                   else if (errorData?.detail) errorBody = `${errorBody} - ${JSON.stringify(errorData.detail)}`;
                   else errorBody = `${errorBody} - ${response.statusText || 'Unknown server error'}`;
               } catch (e) { errorBody = `${errorBody} - ${response.statusText || 'Unknown server error'}`; }
               if (response.status === 404) errorBody = "Audio recording not found.";
               else if (response.status === 401 || response.status === 403) errorBody = "Authorization error fetching audio.";
               throw new Error(`HTTP error fetching audio! ${errorBody}`);
          }
          const audioBlob = await response.blob();
          if (audioBlob.size === 0) {
              if ((log.status === 'failed' || log.status === 'interrupted') && log.call_successful !== 'success') {
                   console.warn(`[ConversationLogCard] Conversation ${log.conversation_id} ended unsuccessfully, no audio expected.`);
                   setFetchError("No audio available (session ended).");
                   setAudioUrl(null); return;
              } else throw new Error("Received empty audio file.");
          }
          if (audioBlob.type && !audioBlob.type.startsWith('audio/')) throw new Error(`Received non-audio file type: ${audioBlob.type}`);
          const objectUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(objectUrl);
      } catch (error: any) {
          console.error(`[ConversationLogCard] Failed to fetch/process audio for ${log.conversation_id}:`, error);
          setFetchError(error.message || 'Unknown audio error');
          toast.error(`Failed to load audio: ${error.message}`);
          setAudioUrl(null);
      } finally { setIsFetchingAudio(false); }
    };

    const handlePlayPauseClick = () => {
         if (!audioRef.current) return;
        if (isPlaying) { audioRef.current.pause(); }
        else {
            if (audioUrl) {
                audioRef.current.play().catch(e => {
                    console.error("Error playing audio:", e); setFetchError("Could not play audio."); setIsPlaying(false);
                });
            } else if (!isFetchingAudio && !fetchError) { fetchAudio(); }
        }
    };

    useEffect(() => {
        if (audioUrl && audioRef.current && !isPlaying && !fetchError && isFetchingAudio === false) {
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                playPromise.then(() => {}).catch(e => {
                    console.error("Error auto-playing audio after fetch:", e);
                    if (!fetchError) { setFetchError("Could not auto-play audio. Press play."); }
                    setIsPlaying(false);
                });
            }
        }
    }, [audioUrl, fetchError]);

    useEffect(() => {
      const currentAudioUrl = audioUrl;
      return () => { if (currentAudioUrl) { URL.revokeObjectURL(currentAudioUrl); } };
    }, [audioUrl]);

    const handleAudioPlay = () => setIsPlaying(true);
    const handleAudioPause = () => setIsPlaying(false);
    const handleAudioEnded = () => setIsPlaying(false);
    const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
        console.error("HTMLAudioElement error:", e); if (!fetchError) { setFetchError("An error occurred during audio playback."); } setIsPlaying(false);
    }

    const canPlayAudio = log.status === 'done';
    const playButtonDisabled = isFetchingAudio || !canPlayAudio || (!audioUrl && fetchError !== null) || !apiKey;
    const playButtonTitle = !apiKey ? "API Key missing"
        : isFetchingAudio ? "Loading audio..."
        : !canPlayAudio ? `Audio not available (status: ${log.status || 'unknown'})`
        : fetchError ? `Audio error: ${fetchError}`
        : isPlaying ? "Pause audio playback"
        : "Play conversation audio";

    const messageCount = log.transcript?.length ?? log.message_count ?? 'N/A';

    return (
      <Card className="overflow-hidden text-sm flex flex-col">
          <CardHeader className="p-4 bg-muted/30 border-b">
               <CardTitle className="text-base flex justify-between items-center">
                  <span className="truncate pr-2" title={log.agent_name || 'Unknown Agent'}>
                      {log.agent_name || 'Unknown Agent'}
                  </span>
                  {getStatusBadge(log.status, log.call_successful)}
              </CardTitle>
               <p className="text-xs text-muted-foreground pt-1 truncate" title={log.conversation_id}>
                   ID: {log.conversation_id}
               </p>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 flex-grow">
              <div className="text-muted-foreground">Started:</div>
              <div>{formatTimestamp(log.start_time_unix_secs)}</div>
              <div className="text-muted-foreground">Duration:</div>
              <div>{formatDuration(log.call_duration_secs)}</div>
              <div className="text-muted-foreground">Messages:</div>
              <div>{messageCount}</div>
              {fetchError && (
                  <div className="col-span-2 mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3"/> Audio Error: {fetchError}
                  </div>
              )}
          </CardContent>
          <CardFooter className="p-3 border-t bg-muted/50 grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" onClick={() => onViewDetails(log.conversation_id)} className="w-full flex items-center justify-center gap-2 text-primary hover:bg-primary/10" disabled={!apiKey} title={!apiKey ? "API Key missing" : "View conversation details"}>
                  <Eye className="h-4 w-4" />
                  <span>Details</span>
                </Button>
               <Button variant="outline" size="sm" onClick={handlePlayPauseClick} disabled={playButtonDisabled} className="w-full flex items-center justify-center gap-2" title={playButtonTitle}>
                  {isFetchingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isFetchingAudio ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}</span>
                </Button>
              <audio ref={audioRef} src={audioUrl || undefined} onPlay={handleAudioPlay} onPause={handleAudioPause} onEnded={handleAudioEnded} onError={handleAudioError} style={{ display: 'none' }} />
          </CardFooter>
      </Card>
    );
};

const Stories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [elevenLabsConversations, setElevenLabsConversations] = useState<ElevenLabsConversationStub[]>([]);
  const [isLoadingELList, setIsLoadingELList] = useState(false);
  const [errorELList, setErrorELList] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationDetails, setConversationDetails] = useState<ElevenLabsConversationDetail | null>(null);
  const [isLoadingELDetails, setIsLoadingELDetails] = useState(false);
  const [errorELDetails, setErrorELDetails] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const apiKey = getApiKey();

  // Check if API key is available
  if (!apiKey && !import.meta.env.PROD) { console.error("CRITICAL SECURITY WARNING: API Key missing/hardcoded."); }

  useEffect(() => {
    const fetchConversationsForUser = async () => {
      if (!apiKey) {
        setErrorELList("API Key missing.");
        return;
      }

      if (!user) {
        console.log("No authenticated user found, can't fetch conversations");
        setErrorELList("You need to be logged in to view your practice sessions.");
        setElevenLabsConversations([]);
        return;
      }

      setIsLoadingELList(true);
      setErrorELList(null);
      
      try {
        // Use our new function to fetch user-specific conversations
        const conversations = await fetchUserConversations();
        
        if (Array.isArray(conversations)) {
          // Sort conversations by start time, most recent first
          const sorted = conversations.sort((a, b) => 
            (b.start_time_unix_secs ?? 0) - (a.start_time_unix_secs ?? 0)
          );
          setElevenLabsConversations(sorted);
        } else {
          console.warn("Invalid list format received from user conversations API");
          setElevenLabsConversations([]);
          setErrorELList("Invalid data format for list.");
        }
      } catch (error: any) {
        console.error("Failed to fetch user conversations:", error);
        setErrorELList(error.message || 'Unknown error fetching conversations');
        toast.error(`Failed to fetch practice logs: ${error.message || 'Unknown error'}`);
        setElevenLabsConversations([]);
      } finally {
        setIsLoadingELList(false);
      }
    };

    fetchConversationsForUser();
  }, [user, apiKey]); // Re-fetch when user or API key changes

  const fetchConversationDetails = async (conversationId: string) => {
      if (!apiKey) {
        setErrorELDetails("API Key missing.");
        toast.error("Config error: API Key missing.");
        return;
      }
      if (!conversationId) {
        setErrorELDetails("No Conversation ID provided.");
        return;
      }

      console.log(`[Stories Page] Fetching details for ID: ${conversationId}`);
      setIsLoadingELDetails(true);
      
      const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
      try {
          const response = await fetch(url, { method: 'GET', headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' } });

          if (!response.ok) {
              let errorBody = `Status: ${response.status}`;
              try { const d = await response.json(); if (d?.detail?.message) errorBody = `${errorBody} - ${d.detail.message}`; else if (d?.detail) errorBody = `${errorBody} - ${JSON.stringify(d.detail)}`; else errorBody = `${errorBody} - ${response.statusText || 'Unknown server error'}`; } catch (e) { errorBody = `${errorBody} - ${response.statusText || 'Unknown server error'}`; }
              if (response.status === 404) errorBody = "Conversation details not found."; else if (response.status === 401) errorBody += " (Check API Key)";
              throw new Error(`HTTP error fetching details! ${errorBody}`);
          }

          const rawData = await response.json();
          console.log(`[Stories Page] Received raw details data for ${conversationId}:`, JSON.stringify(rawData, null, 2));

          if (!rawData || typeof rawData !== 'object') { throw new Error("Invalid or empty data received from API."); }

          const processedData: Partial<ElevenLabsConversationDetail> = {
             ...rawData,
             messages: []
          };

          if (Array.isArray(rawData.transcript)) {
              console.log(`[Stories Page] Found 'transcript' array with length: ${rawData.transcript.length}. Mapping to 'messages'.`);
              processedData.messages = rawData.transcript.map((item: any) => ({
                  ...item,
                  author: item.role,
                  text: item.message
              }));
          } else {
              console.warn(`[Stories Page] Conversation ${conversationId} 'transcript' is missing or not an array. 'messages' will be empty. Received 'transcript':`, rawData.transcript);
          }

          console.log(`[Stories Page] Processed data object being set to state:`, JSON.stringify(processedData, null, 2));
          setConversationDetails(processedData as ElevenLabsConversationDetail);
          toast.success("Details loaded.");
      } catch (error: any) {
          console.error(`Failed to fetch details for ${conversationId}:`, error);
          setErrorELDetails(error.message || 'Unknown error fetching details');
          toast.error(`Failed load details: ${error.message || 'Unknown error'}`);
          setConversationDetails(null);
      } finally {
          setIsLoadingELDetails(false);
      }
  };

  const handleViewDetails = (conversationId: string) => {
      if (selectedConversationId === conversationId && conversationDetails) {
           return;
      }
      setSelectedConversationId(conversationId);
      setConversationDetails(null);
      setErrorELDetails(null);
      setIsLoadingELDetails(true);
      fetchConversationDetails(conversationId);
  };

  const filteredLogs = elevenLabsConversations.filter(log => {
      const lowerSearch = searchTerm.toLowerCase();
      return (log.agent_name && log.agent_name.toLowerCase().includes(lowerSearch)) ||
             log.conversation_id.toLowerCase().includes(lowerSearch) ||
             (log.status && log.status.toLowerCase().includes(lowerSearch));
  });

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold mb-2">Practice Logs</h1>
            <p className="text-muted-foreground">Review practice sessions and listen to recordings.</p>
        </div>
        <Button onClick={() => navigate('/create')} className="flex items-center gap-2 self-start md:self-center">
          <Book size={18} /> Create Story
        </Button>
      </div>
      
      {!user && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md flex items-center gap-2 text-sm">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span>You need to be logged in to view your practice sessions.</span>
        </div>
      )}

      {!apiKey && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-md flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>CRITICAL SECURITY WARNING: API Key missing/not configured securely. Features will fail.</span>
        </div>
      )}
      
      {isLoadingELList && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded-md flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading conversation logs list...
        </div>
      )}
      
      {errorELList && !isLoadingELList && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" /> Error fetching logs list: {errorELList}
        </div>
      )}

      {!isLoadingELList && elevenLabsConversations.length === 0 && !errorELList ? (
        <EmptyState 
          title="No practice logs found" 
          description="Complete practice sessions to see them here." 
          buttonText="Create a Story" 
          buttonLink="/create" 
          icon="book"
        />
      ) : (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search logs by agent name or ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-9"
            />
          </div>
          
          <div className="mt-6">
            {isLoadingELList ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : errorELList ? (
              <div className="text-center py-12 text-destructive">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">Failed to load logs list</h3>
                <p className="text-sm">{errorELList}</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No matching logs found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or create a practice session.</p>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLogs.map((log) => (
                  <ConversationLogCard 
                    key={log.conversation_id} 
                    log={log} 
                    apiKey={apiKey} 
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={!!selectedConversationId} onOpenChange={(open) => { if (!open) setSelectedConversationId(null); }}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'max-w-3xl w-[90vw]'}`}>
            <DialogHeader>
                <DialogTitle>Conversation Details</DialogTitle>
                <DialogDescription>
                    Review the transcript of the practice session.
                    {selectedConversationId && (<span className="block text-xs text-muted-foreground mt-1">ID: {selectedConversationId}</span>)}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                {isLoadingELDetails && (
                    <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-muted-foreground">Loading details...</span></div>
                )}

                {!isLoadingELDetails && errorELDetails && (
                    <div className="flex flex-col items-center justify-center h-40 text-center text-destructive bg-red-50 p-4 rounded-md border border-red-200"><AlertTriangle className="h-8 w-8 mb-3" /><p className="font-semibold mb-1">Error loading details</p><p className="text-sm">{errorELDetails}</p></div>
                )}

                {!isLoadingELDetails && !errorELDetails && conversationDetails && (
                    <div className="space-y-4">
                        <div className={`${isMobile ? 'grid grid-cols-1' : 'grid grid-cols-2 md:grid-cols-3'} gap-x-4 gap-y-1 text-sm p-3 bg-muted/50 rounded-md border`}>
                            <div><span className="font-medium text-muted-foreground">Agent:</span> {conversationDetails.agent_name || 'N/A'}</div>
                            <div><span className="font-medium text-muted-foreground">Status:</span> {conversationDetails.status || 'N/A'}</div>
                            <div><span className="font-medium text-muted-foreground">Result:</span> {conversationDetails.call_successful || 'N/A'}</div>
                            <div><span className="font-medium text-muted-foreground">Messages:</span> {conversationDetails.messages?.length ?? 0}</div>
                        </div>
                        <Separator />

                        <h4 className="text-md font-semibold mb-2">Transcript ({conversationDetails.messages?.length ?? 0} messages):</h4>
                        {Array.isArray(conversationDetails.messages) && conversationDetails.messages.length > 0 ? (
                            <ScrollArea className={`${isMobile ? 'h-[50vh]' : 'h-[40vh]'} border rounded-md p-3 bg-background`}>
                                <div className="space-y-4">
                                    {conversationDetails.messages.map((msg, index) => (
                                        <div key={`${selectedConversationId}-msg-${index}`} className={`flex flex-col ${msg?.author === 'user' ? 'items-end' : 'items-start'}`}>
                                            {msg && typeof msg === 'object' ? (
                                                <>
                                                    <Badge variant={msg.author === 'user' ? 'default' : 'secondary'} className="mb-1 capitalize text-xs px-2 py-0.5">
                                                        {msg.author || 'unknown'}
                                                    </Badge>
                                                    <div className={`p-3 rounded-lg ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} text-sm shadow-sm ${msg.author === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                        {typeof msg.text === 'string'
                                                            ? msg.text.split('\n').map((line, i) => (<React.Fragment key={i}>{line}{i < msg.text.split('\n').length - 1 && <br />}</React.Fragment>))
                                                            : <span className="italic text-muted-foreground">[Empty or invalid message text]</span>
                                                        }
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-xs text-red-500 italic">[Invalid message data structure]</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-muted-foreground text-center py-4 italic">
                                No messages were recorded for this conversation session.
                                {(conversationDetails.status && conversationDetails.status !== 'done') || (conversationDetails.call_successful && conversationDetails.call_successful !== 'success') ?
                                    ` (Status: ${conversationDetails.status || 'N/A'}, Result: ${conversationDetails.call_successful || 'N/A'})`
                                    : ''}
                            </p>
                        )}
                    </div>
                )}

                {!isLoadingELDetails && !errorELDetails && !conversationDetails && (
                     selectedConversationId ? (
                         <div className="flex justify-center items-center h-40">
                             <p className="text-muted-foreground">No details available to display.</p>
                         </div>
                     ) : null
                )}
            </div>
            <DialogFooter className="sm:justify-end">
                <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Stories;
