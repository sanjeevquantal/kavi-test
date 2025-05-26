
// import React, { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Mic, X, MessageSquare, Volume2, User, Bot } from 'lucide-react';
// import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { toast } from 'sonner';
// import CountdownTimer from './CountdownTimer';

// type ElevenLabsConversationProps = {
//   type: 'delivery' | 'star' | 'scratch';
//   onClose: () => void;
//   storyId?: string;
// };

// const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({ 
//   type, 
//   onClose,
//   storyId 
// }) => {
//   const { 
//     status, 
//     mode, 
//     isLoading, 
//     isModuleLoaded,
//     messages,
//     audioUrl,
//     startConversation, 
//     stopConversation 
//   } = useElevenLabsConversation(type, storyId);
  
//   const [timerKey, setTimerKey] = useState<number>(0);

//   // Reset the timer when conversation status changes
//   useEffect(() => {
//     // Reset timer key when status changes to connected (new timer instance)
//     if (status === 'connected') {
//       setTimerKey(prev => prev + 1);
//     }
//   }, [status]);

//   useEffect(() => {
//     if (isModuleLoaded && !isLoading) {
//       toast.info("Tap the circle to start or stop a conversation", {
//         duration: 5000,
//         position: 'bottom-center'
//       });
//     }
//   }, [isModuleLoaded, isLoading]);

//   const getTitle = () => {
//     switch(type) {
//       case 'delivery': return 'Voice Design';
//       case 'star': return 'STAR Method Companion';
//       case 'scratch': return 'Start From Scratch';
//     }
//   };

//   const handleCircleClick = () => {
//     if (status === 'connected') {
//       stopConversation();
//     } else if (!isLoading) {
//       startConversation();
//     }
//   };

//   const handleTimerEnd = () => {
//     if (status === 'connected') {
//       toast.warning("Time's up! Your 20-minute session has ended.", {
//         duration: 5000,
//       });
//       stopConversation();
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto flex flex-col items-center">
//       <div className="flex justify-between items-center w-full mb-6">
//         <h2 className="text-xl font-semibold">{getTitle()}</h2>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X size={18} />
//         </Button>
//       </div>

//       {status === 'connected' || messages.length > 0 ? (
//         <Tabs defaultValue="call" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-4">
//             <TabsTrigger value="call" className="flex items-center">
//               <Mic className="mr-2 h-4 w-4" />
//               Call
//             </TabsTrigger>
//             <TabsTrigger value="transcript" className="flex items-center">
//               <MessageSquare className="mr-2 h-4 w-4" />
//               Transcript
//             </TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="call" className="space-y-4">
//             <div 
//               className={`relative w-64 h-64 rounded-full flex items-center justify-center mx-auto ${!isLoading && isModuleLoaded ? "cursor-pointer transition-all duration-300" : ""}`}
//               style={{
//                 background: "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
//                 backgroundSize: "cover",
//                 backgroundPosition: "center"
//               }}
//               onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
//             >
//               {status === 'connected' 
//               && (
//                 <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
//                   <CountdownTimer 
//                     key={timerKey} // Use a key to reset the timer completely
//                     durationMinutes={20} 
//                     onEnd={handleTimerEnd} 
//                     isActive={status === 'connected'} 
//                   />
//                 </div>
//               )}
//               <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
//                 <div className={`bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border ${status === 'connected' ? 'border-accent' : 'border-white/20'} transition-all`}>
//                   {!isModuleLoaded ? (
//                     <div className="text-white flex flex-col items-center">
//                       <div className="animate-spin mb-2">
//                         <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                       </div>
//                       <span className="text-sm">Loading ElevenLabs...</span>
//                     </div>
//                   ) : isLoading ? (
//                     <div className="text-white flex flex-col items-center">
//                       <div className="animate-spin mb-2">
//                         <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                       </div>
//                       <span className="text-sm">Connecting...</span>
//                     </div>
//                   ) : status === 'connected' ? (
//                     <div className={`text-white ${mode === 'speaking' ? 'animate-pulse' : ''}`}>
//                       <div className="flex flex-col items-center">
//                         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                           <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                         </svg>
//                         <span className="text-sm mt-2">Active Call</span>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-white flex flex-col items-center">
//                       <Mic size={48} strokeWidth={1.5} />
//                       <span className="text-sm mt-2">Try a call</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 text-center">
//               <p className="font-medium">
//                 {!isModuleLoaded 
//                   ? 'Loading ElevenLabs...' 
//                   : status === 'connected' 
//                     ? `Agent is ${mode === 'speaking' ? 'speaking' : 'listening'}` 
//                     : isLoading ? 'Connecting...' : 'Tap to start a conversation'}
//               </p>
//               {status === 'connected' && (
//                 <p className="text-sm text-muted-foreground mt-1">
//                   The session will automatically end in 20 minutes
//                 </p>
//               )}
//             </div>
//           </TabsContent>
          
//           <TabsContent value="transcript" className="max-h-[60vh] overflow-y-auto pr-2">
//             <div className="space-y-4 py-2">
//               {messages.length > 0 ? (
//                 messages.map((message, index) => (
//                   <div 
//                     key={index} 
//                     className={`p-4 rounded-lg ${
//                       message.role === 'ai' 
//                         ? 'bg-accent/20 border border-accent/20 ml-4' 
//                         : 'bg-primary/10 border border-primary/10 mr-4'
//                     }`}
//                   >
//                     <div className="flex items-center mb-2">
//                       <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 
//                         ${message.role === 'ai' 
//                           ? 'bg-accent text-accent-foreground' 
//                           : 'bg-primary text-primary-foreground'
//                         }`}
//                       >
//                         {message.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
//                       </div>
//                       <div className="font-medium">
//                         {message.role === 'ai' ? 'Interview Coach' : 'You'}
//                       </div>
//                       <div className="text-xs text-muted-foreground ml-auto">
//                         {new Date().toLocaleTimeString([], {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </div>
//                     </div>
//                     <p className="pl-10">{message.content}</p>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-12">
//                   <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
//                   <p className="font-medium">No conversation transcript yet</p>
//                   <p className="text-sm mt-1 text-muted-foreground">
//                     Start a conversation to see the transcript here
//                   </p>
//                 </div>
//               )}

//               {audioUrl && (
//                 <div className="mt-6 p-4 border rounded-lg">
//                   <div className="flex items-center space-x-2 mb-2">
//                     <Volume2 size={18} />
//                     <span className="font-medium">Audio Recording</span>
//                   </div>
//                   <audio 
//                     className="w-full" 
//                     controls 
//                     src={audioUrl}
//                   />
//                 </div>
//               )}
//             </div>
//           </TabsContent>
//         </Tabs>
//       ) : (
//         <div className="flex flex-col items-center">
//           <div 
//             className={`relative w-64 h-64 rounded-full flex items-center justify-center ${!isLoading && isModuleLoaded ? "cursor-pointer transition-all duration-300 hover:scale-105" : ""}`}
//             style={{
//               background: "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
//               backgroundSize: "cover",
//               backgroundPosition: "center"
//             }}
//             onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
//           >
//             <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
//               <div className="bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border border-white/20">
//                 {!isModuleLoaded ? (
//                   <div className="text-white flex flex-col items-center">
//                     <div className="animate-spin mb-2">
//                       <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                     </div>
//                     <span className="text-sm">Loading ElevenLabs...</span>
//                   </div>
//                 ) : isLoading ? (
//                   <div className="text-white flex flex-col items-center">
//                     <div className="animate-spin mb-2">
//                       <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                     </div>
//                     <span className="text-sm">Connecting...</span>
//                   </div>
//                 ) : (
//                   <div className="text-white flex flex-col items-center">
//                     <Mic size={48} strokeWidth={1.5} />
//                     <span className="text-sm mt-2">Try a call</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 text-center">
//             <p className="font-medium">
//               {!isModuleLoaded 
//                 ? 'Loading ElevenLabs...' 
//                 : isLoading ? 'Connecting...' : 'Tap to start a conversation'}
//             </p>
//             {isModuleLoaded && !isLoading && (
//               <p className="text-sm text-muted-foreground mt-1">
//                 Your conversation will be saved for later review
//               </p>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ElevenLabsConversation;

//2nd try 

// import React, { useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Mic,
//   X,
//   MessageSquare,
//   Volume2,
//   User,
//   Bot,
// } from "lucide-react";
// import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import { toast } from "sonner";
// import CountdownTimer from "./CountdownTimer";

// type ElevenLabsConversationProps = {
//   type: "delivery" | "star" | "scratch";
//   onClose: () => void;
//   storyId?: string;
// };

// const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({
//   type,
//   onClose,
//   storyId,
// }) => {
//   const {
//     status,
//     mode,
//     isLoading,
//     isModuleLoaded,
//     messages,
//     audioUrl,
//     startConversation,
//     stopConversation,
//   } = useElevenLabsConversation(type, storyId);

//   /* tip message once module ready */
//   useEffect(() => {
//     if (isModuleLoaded && !isLoading) {
//       toast.info("Tap the circle to start or stop a conversation", {
//         duration: 5000,
//         position: "bottom-center",
//       });
//     }
//   }, [isModuleLoaded, isLoading]);

//   const getTitle = () => {
//     switch (type) {
//       case "delivery":
//         return "Voice Design";
//       case "star":
//         return "STAR Method Companion";
//       case "scratch":
//         return "Start From Scratch";
//     }
//   };

//   const handleCircleClick = () => {
//     if (status === "connected") {
//       stopConversation();
//     } else if (!isLoading) {
//       startConversation();
//     }
//   };

//   const handleTimerEnd = () => {
//     if (status === "connected") {
//       toast.warning("Time's up! Your 20‑minute session has ended.", {
//         duration: 5000,
//       });
//       stopConversation();
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto flex flex-col items-center">
//       {/* ── header bar ───────────────────────── */}
//       <div className="flex justify-between items-center w-full mb-6">
//         <h2 className="text-xl font-semibold">{getTitle()}</h2>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X size={18} />
//         </Button>
//       </div>

//       {/* ── main body ───────────────────────── */}
//       {status === "connected" || messages.length > 0 ? (
//         <Tabs defaultValue="call" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-4">
//             <TabsTrigger value="call" className="flex items-center">
//               <Mic className="mr-2 h-4 w-4" />
//               Call
//             </TabsTrigger>
//             <TabsTrigger value="transcript" className="flex items-center">
//               <MessageSquare className="mr-2 h-4 w-4" />
//               Transcript
//             </TabsTrigger>
//           </TabsList>

//           {/* ── Call tab (kept mounted) ───────── */}
//           <TabsContent
//             value="call"
//             forceMount
//             className="space-y-4"
//           >
//             <div
//               className={`relative w-64 h-64 rounded-full flex items-center justify-center mx-auto ${
//                 !isLoading && isModuleLoaded
//                   ? "cursor-pointer transition-all duration-300"
//                   : ""
//               }`}
//               style={{
//                 background:
//                   "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//               }}
//               onClick={
//                 isModuleLoaded && !isLoading ? handleCircleClick : undefined
//               }
//             >
//               {status === "connected" && (
//                 <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
//                   <CountdownTimer
//                     durationMinutes={20}
//                     onEnd={handleTimerEnd}
//                     isActive={status === "connected"}
//                   />
//                 </div>
//               )}

//               {/* blurred inner circle */}
//               <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
//                 <div
//                   className={`bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border ${
//                     status === "connected"
//                       ? "border-accent"
//                       : "border-white/20"
//                   } transition-all`}
//                 >
//                   {/* inner state */}
//                   {!isModuleLoaded ? (
//                     <Loader text="Loading ElevenLabs…" />
//                   ) : isLoading ? (
//                     <Loader text="Connecting…" />
//                   ) : status === "connected" ? (
//                     <ActiveIndicator mode={mode} />
//                   ) : (
//                     <IdleIndicator />
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 text-center">
//               <p className="font-medium">
//                 {!isModuleLoaded
//                   ? "Loading ElevenLabs…"
//                   : status === "connected"
//                   ? `Agent is ${
//                       mode === "speaking" ? "speaking" : "listening"
//                     }`
//                   : isLoading
//                   ? "Connecting…"
//                   : "Tap to start a conversation"}
//               </p>
//               {status === "connected" && (
//                 <p className="text-sm text-muted-foreground mt-1">
//                   The session will automatically end in 20 minutes
//                 </p>
//               )}
//             </div>
//           </TabsContent>

//           {/* ── Transcript tab (also force‑mounted for scroll persistence) */}
//           <TabsContent
//             value="transcript"
//             forceMount
//             className="max-h-[60vh] overflow-y-auto pr-2"
//           >
//             <div className="space-y-4 py-2">
//               {messages.length > 0 ? (
//                 messages.map((m, i) => (
//                   <MessageBubble key={i} message={m} />
//                 ))
//               ) : (
//                 <EmptyTranscript />
//               )}

//               {audioUrl && <AudioPlayer src={audioUrl} />}
//             </div>
//           </TabsContent>
//         </Tabs>
//       ) : (
//         /* ── empty state before first call ──── */
//         <IdleStart
//           isModuleLoaded={isModuleLoaded}
//           isLoading={isLoading}
//           handleCircleClick={handleCircleClick}
//         />
//       )}
//     </div>
//   );
// };

// export default ElevenLabsConversation;

// /* ------------------------------------------------------------------ */
// /* helper sub‑components (pure markup, no logic)                      */
// /* ------------------------------------------------------------------ */
// const Loader: React.FC<{ text: string }> = ({ text }) => (
//   <div className="text-white flex flex-col items-center">
//     <svg
//       className="w-12 h-12 animate-spin mb-2"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//     >
//       <circle
//         className="opacity-25"
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="2"
//       />
//       <path
//         className="opacity-75"
//         fill="currentColor"
//         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//       />
//     </svg>
//     <span className="text-sm">{text}</span>
//   </div>
// );

// const ActiveIndicator: React.FC<{ mode: string }> = ({ mode }) => (
//   <div
//     className={`text-white ${
//       mode === "speaking" ? "animate-pulse" : ""
//     }`}
//   >
//     <div className="flex flex-col items-center">
//       <svg
//         width="48"
//         height="48"
//         viewBox="0 0 24 24"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z"
//           stroke="currentColor"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//       <span className="text-sm mt-2">Active Call</span>
//     </div>
//   </div>
// );

// const IdleIndicator: React.FC = () => (
//   <div className="text-white flex flex-col items-center">
//     <Mic size={48} strokeWidth={1.5} />
//     <span className="text-sm mt-2">Try a call</span>
//   </div>
// );

// const EmptyTranscript: React.FC = () => (
//   <div className="text-center py-12">
//     <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
//     <p className="font-medium">No conversation transcript yet</p>
//     <p className="text-sm mt-1 text-muted-foreground">
//       Start a conversation to see the transcript here
//     </p>
//   </div>
// );

// const AudioPlayer: React.FC<{ src: string }> = ({ src }) => (
//   <div className="mt-6 p-4 border rounded-lg">
//     <div className="flex items-center space-x-2 mb-2">
//       <Volume2 size={18} />
//       <span className="font-medium">Audio Recording</span>
//     </div>
//     <audio className="w-full" controls src={src} />
//   </div>
// );

// const MessageBubble: React.FC<{ message: any }> = ({ message }) => (
//   <div
//     className={`p-4 rounded-lg ${
//       message.role === "ai"
//         ? "bg-accent/20 border border-accent/20 ml-4"
//         : "bg-primary/10 border border-primary/10 mr-4"
//     }`}
//   >
//     <div className="flex items-center mb-2">
//       <div
//         className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
//           message.role === "ai"
//             ? "bg-accent text-accent-foreground"
//             : "bg-primary text-primary-foreground"
//         }`}
//       >
//         {message.role === "ai" ? <Bot size={16} /> : <User size={16} />}
//       </div>
//       <div className="font-medium">
//         {message.role === "ai" ? "Interview Coach" : "You"}
//       </div>
//       <div className="text-xs text-muted-foreground ml-auto">
//         {new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         })}
//       </div>
//     </div>
//     <p className="pl-10">{message.content}</p>
//   </div>
// );

// const IdleStart: React.FC<{
//   isModuleLoaded: boolean;
//   isLoading: boolean;
//   handleCircleClick: () => void;
// }> = ({ isModuleLoaded, isLoading, handleCircleClick }) => (
//   <div className="flex flex-col items-center">
//     <div
//       className={`relative w-64 h-64 rounded-full flex items-center justify-center ${
//         !isLoading && isModuleLoaded
//           ? "cursor-pointer transition-all duration-300 hover:scale-105"
//           : ""
//       }`}
//       style={{
//         background:
//           "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//       onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
//     >
//       <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
//         <div className="bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border border-white/20">
//           {!isModuleLoaded ? (
//             <Loader text="Loading ElevenLabs…" />
//           ) : isLoading ? (
//             <Loader text="Connecting…" />
//           ) : (
//             <IdleIndicator />
//           )}
//         </div>
//       </div>
//     </div>

//     <div className="mt-6 text-center">
//       <p className="font-medium">
//         {!isModuleLoaded
//           ? "Loading ElevenLabs…"
//           : isLoading
//           ? "Connecting…"
//           : "Tap to start a conversation"}
//       </p>
//       {isModuleLoaded && !isLoading && (
//         <p className="text-sm text-muted-foreground mt-1">
//           Your conversation will be saved for later review
//         </p>
//       )}
//     </div>
//   </div>
// );

//3rd try 
// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Mic,
//   X,
//   MessageSquare,
//   Volume2,
//   User,
//   Bot,
// } from "lucide-react";
// import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import { toast } from "sonner";
// import CountdownTimer from "./CountdownTimer";

// /* ------------------------------------------------------------------ */
// /* main component                                                     */
// /* ------------------------------------------------------------------ */
// type ElevenLabsConversationProps = {
//   type: "delivery" | "star" | "scratch";
//   onClose: () => void;
//   storyId?: string;
// };

// const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({
//   type,
//   onClose,
//   storyId,
// }) => {
//   const {
//     status,
//     mode,
//     isLoading,
//     isModuleLoaded,
//     messages,
//     audioUrl,
//     startConversation,
//     stopConversation,
//   } = useElevenLabsConversation(type, storyId);

//   /* 🔸 track which tab is active */
//   const [tab, setTab] = useState<"call" | "transcript">("call");

//   /* tip toast */
//   useEffect(() => {
//     if (isModuleLoaded && !isLoading) {
//       toast.info("Tap the circle to start or stop a conversation", {
//         duration: 5000,
//         position: "bottom-center",
//       });
//     }
//   }, [isModuleLoaded, isLoading]);

//   const getTitle = () =>
//     ({ delivery: "Voice Design", star: "STAR Method Companion", scratch: "Start From Scratch" }[type]);

//   const handleCircleClick = () => {
//     if (status === "connected") stopConversation();
//     else if (!isLoading) startConversation();
//   };

//   const handleTimerEnd = () => {
//     if (status === "connected") {
//       toast.warning("Time's up! Your 20‑minute session has ended.", {
//         duration: 5000,
//       });
//       stopConversation();
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto flex flex-col items-center">
//       {/* header */}
//       <div className="flex justify-between items-center w-full mb-6">
//         <h2 className="text-xl font-semibold">{getTitle()}</h2>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X size={18} />
//         </Button>
//       </div>

//       {status === "connected" || messages.length > 0 ? (
//         <Tabs
//           defaultValue="call"
//           className="w-full"
//           onValueChange={(v) => setTab(v as "call" | "transcript")}
//         >
//           <TabsList className="grid w-full grid-cols-2 mb-4">
//             <TabsTrigger value="call" className="flex items-center">
//               <Mic className="mr-2 h-4 w-4" />
//               Call
//             </TabsTrigger>
//             <TabsTrigger value="transcript" className="flex items-center">
//               <MessageSquare className="mr-2 h-4 w-4" />
//               Transcript
//             </TabsTrigger>
//           </TabsList>

//           {/* ------------------- CALL TAB ------------------- */}
//           <TabsContent value="call" forceMount className="space-y-4">
//             <CallCircle
//               status={status}
//               mode={mode}
//               isLoading={isLoading}
//               isModuleLoaded={isModuleLoaded}
//               handleCircleClick={handleCircleClick}
//               handleTimerEnd={handleTimerEnd}
//             />

//             <CallFooter
//               status={status}
//               mode={mode}
//               isLoading={isLoading}
//               isModuleLoaded={isModuleLoaded}
//             />
//           </TabsContent>

//           {/* ---------------- TRANSCRIPT TAB ---------------- */}
//           <TabsContent value="transcript" className="max-h-[60vh] overflow-y-auto pr-2">
//             {/* render only when this tab is actually selected */}
//             {tab === "transcript" && (
//               <div className="space-y-4 py-2">
//                 {messages.length > 0 ? (
//                   messages.map((m, i) => <MessageBubble key={i} message={m} />)
//                 ) : (
//                   <EmptyTranscript />
//                 )}

//                 {audioUrl && <AudioPlayer src={audioUrl} />}
//               </div>
//             )}
//           </TabsContent>
//         </Tabs>
//       ) : (
//         <IdleStart
//           isModuleLoaded={isModuleLoaded}
//           isLoading={isLoading}
//           handleCircleClick={handleCircleClick}
//         />
//       )}
//     </div>
//   );
// };

// export default ElevenLabsConversation;

// /* ------------------------------------------------------------------ */
// /* sub‑components (unchanged)                                         */
// /* ------------------------------------------------------------------ */
// const CallCircle: React.FC<{
//   status: string;
//   mode: string;
//   isLoading: boolean;
//   isModuleLoaded: boolean;
//   handleCircleClick: () => void;
//   handleTimerEnd: () => void;
// }> = ({
//   status,
//   mode,
//   isLoading,
//   isModuleLoaded,
//   handleCircleClick,
//   handleTimerEnd,
// }) => (
//   <div
//     className={`relative w-64 h-64 rounded-full flex items-center justify-center mx-auto ${
//       !isLoading && isModuleLoaded
//         ? "cursor-pointer transition-all duration-300"
//         : ""
//     }`}
//     style={{
//       background:
//         "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//     }}
//     onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
//   >
//     {status === "connected" && (
//       <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
//         <CountdownTimer
//           durationMinutes={20}
//           onEnd={handleTimerEnd}
//           isActive={status === "connected"}
//         />
//       </div>
//     )}

//     <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
//       <div
//         className={`bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border ${
//           status === "connected" ? "border-accent" : "border-white/20"
//         } transition-all`}
//       >
//         {!isModuleLoaded ? (
//           <Loader text="Loading ElevenLabs…" />
//         ) : isLoading ? (
//           <Loader text="Connecting…" />
//         ) : status === "connected" ? (
//           <ActiveIndicator mode={mode} />
//         ) : (
//           <IdleIndicator />
//         )}
//       </div>
//     </div>
//   </div>
// );

// const CallFooter: React.FC<{
//   status: string;
//   mode: string;
//   isLoading: boolean;
//   isModuleLoaded: boolean;
// }> = ({ status, mode, isLoading, isModuleLoaded }) => (
//   <div className="mt-6 text-center">
//     <p className="font-medium">
//       {!isModuleLoaded
//         ? "Loading ElevenLabs…"
//         : status === "connected"
//         ? `Agent is ${mode === "speaking" ? "speaking" : "listening"}`
//         : isLoading
//         ? "Connecting…"
//         : "Tap to start a conversation"}
//     </p>
//     {status === "connected" && (
//       <p className="text-sm text-muted-foreground mt-1">
//         The session will automatically end in 20 minutes
//       </p>
//     )}
//   </div>
// );

// /* ——— loader / indicators / bubbles / idle start (same as before) ——— */
// const Loader: React.FC<{ text: string }> = ({ text }) => (
//   <div className="text-white flex flex-col items-center">
//     <svg
//       className="w-12 h-12 animate-spin mb-2"
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//     >
//       <circle
//         className="opacity-25"
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="2"
//       />
//       <path
//         className="opacity-75"
//         fill="currentColor"
//         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//       />
//     </svg>
//     <span className="text-sm">{text}</span>
//   </div>
// );

// const ActiveIndicator: React.FC<{ mode: string }> = ({ mode }) => (
//   <div className={`text-white ${mode === "speaking" ? "animate-pulse" : ""}`}>
//     <div className="flex flex-col items-center">
//       <svg
//         width="48"
//         height="48"
//         viewBox="0 0 24 24"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z"
//           stroke="currentColor"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//       </svg>
//       <span className="text-sm mt-2">Active Call</span>
//     </div>
//   </div>
// );

// const IdleIndicator: React.FC = () => (
//   <div className="text-white flex flex-col items-center">
//     <Mic size={48} strokeWidth={1.5} />
//     <span className="text-sm mt-2">Try a call</span>
//   </div>
// );

// const EmptyTranscript: React.FC = () => (
//   <div className="text-center py-12">
//     <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
//     <p className="font-medium">No conversation transcript yet</p>
//     <p className="text-sm mt-1 text-muted-foreground">
//       Start a conversation to see the transcript here
//     </p>
//   </div>
// );

// const AudioPlayer: React.FC<{ src: string }> = ({ src }) => (
//   <div className="mt-6 p-4 border rounded-lg">
//     <div className="flex items-center space-x-2 mb-2">
//       <Volume2 size={18} />
//       <span className="font-medium">Audio Recording</span>
//     </div>
//     <audio className="w-full" controls src={src} />
//   </div>
// );

// const MessageBubble: React.FC<{ message: any }> = ({ message }) => (
//   <div
//     className={`p-4 rounded-lg ${
//       message.role === "ai"
//         ? "bg-accent/20 border border-accent/20 ml-4"
//         : "bg-primary/10 border border-primary/10 mr-4"
//     }`}
//   >
//     <div className="flex items-center mb-2">
//       <div
//         className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
//           message.role === "ai"
//             ? "bg-accent text-accent-foreground"
//             : "bg-primary text-primary-foreground"
//         }`}
//       >
//         {message.role === "ai" ? <Bot size={16} /> : <User size={16} />}
//       </div>
//       <div className="font-medium">
//         {message.role === "ai" ? "Interview Coach" : "You"}
//       </div>
//       <div className="text-xs text-muted-foreground ml-auto">
//         {new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//         })}
//       </div>
//     </div>
//     <p className="pl-10">{message.content}</p>
//   </div>
// );

// const IdleStart: React.FC<{
//   isModuleLoaded: boolean;
//   isLoading: boolean;
//   handleCircleClick: () => void;
// }> = ({ isModuleLoaded, isLoading, handleCircleClick }) => (
//   <div className="flex flex-col items-center">
//     <div
//       className={`relative w-64 h-64 rounded-full flex items-center justify-center ${
//         !isLoading && isModuleLoaded
//           ? "cursor-pointer transition-all duration-300 hover:scale-105"
//           : ""
//       }`}
//       style={{
//         background:
//           "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//       onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
//     >
//       <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
//         <div className="bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border border-white/20">
//           {!isModuleLoaded ? (
//             <Loader text="Loading ElevenLabs…" />
//           ) : isLoading ? (
//             <Loader text="Connecting…" />
//           ) : (
//             <IdleIndicator />
//           )}
//         </div>
//       </div>
//     </div>

//     <div className="mt-6 text-center">
//       <p className="font-medium">
//         {!isModuleLoaded
//           ? "Loading ElevenLabs…"
//           : isLoading
//           ? "Connecting…"
//           : "Tap to start a conversation"}
//       </p>
//       {isModuleLoaded && !isLoading && (
//         <p className="text-sm text-muted-foreground mt-1">
//           Your conversation will be saved for later review
//         </p>
//       )}
//     </div>
//   </div>
// );

//4th try
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  X,
  MessageSquare,
  Volume2,
  User,
  Bot,
} from "lucide-react";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import CountdownTimer from "./CountdownTimer";

/* ------------------------------------------------------------------ */
/* main component                                                     */
/* ------------------------------------------------------------------ */
type ElevenLabsConversationProps = {
  type: "delivery" | "star" | "scratch";
  onClose: () => void;
  storyId?: string;
};

const ElevenLabsConversation: React.FC<ElevenLabsConversationProps> = ({
  type,
  onClose,
  storyId,
}) => {
  const {
    status,
    mode,
    isLoading,
    isModuleLoaded,
    messages,
    audioUrl,
    startConversation,
    stopConversation,
  } = useElevenLabsConversation(type, storyId);

  /* track active tab */
  const [tab, setTab] = useState<"call" | "transcript">("call");

  /* helper toast */
  useEffect(() => {
    if (isModuleLoaded && !isLoading) {
      toast.info("Tap the circle to start or stop a conversation", {
        duration: 5000,
        position: "bottom-center",
      });
    }
  }, [isModuleLoaded, isLoading]);

  const getTitle = () =>
    ({ delivery: "Voice Design", star: "STAR Method Companion", scratch: "Start From Scratch" }[type]);

  const handleCircleClick = () => {
    if (status === "connected") stopConversation();
    else if (!isLoading) startConversation();
  };

  const handleTimerEnd = () => {
    if (status === "connected") {
      toast.warning("Time's up! Your 20‑minute session has ended.", {
        duration: 5000,
      });
      stopConversation();
    }
  };

  return (
    <div className="max-w-md mx-auto flex flex-col items-center">
      {/* header bar */}
      <div className="flex justify-between items-center w-full mb-6">
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      {status === "connected" || messages.length > 0 ? (
        <Tabs
          defaultValue="call"
          className="w-full"
          onValueChange={(v) => setTab(v as "call" | "transcript")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="call" className="flex items-center">
              <Mic className="mr-2 h-4 w-4" />
              Call
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Transcript
            </TabsTrigger>
          </TabsList>

          {/* ───── Call UI (kept mounted but hidden when tab ≠ call) ───── */}
          <TabsContent
            value="call"
            forceMount
            /* hide visually when user is on Transcript tab */
            className={`space-y-4 ${tab === "transcript" ? "hidden" : ""}`}
          >
            <CallCircle
              status={status}
              mode={mode}
              isLoading={isLoading}
              isModuleLoaded={isModuleLoaded}
              handleCircleClick={handleCircleClick}
              handleTimerEnd={handleTimerEnd}
            />
            <CallFooter
              status={status}
              mode={mode}
              isLoading={isLoading}
              isModuleLoaded={isModuleLoaded}
            />
          </TabsContent>

          {/* ───── Transcript UI (shows only when tab = transcript) ───── */}
          <TabsContent
            value="transcript"
            forceMount
            className={`max-h-[60vh] overflow-y-auto pr-2 ${
              tab !== "transcript" ? "hidden" : ""
            }`}
          >
            <div className="space-y-4 py-2">
              {messages.length > 0 ? (
                messages.map((m, i) => <MessageBubble key={i} message={m} />)
              ) : (
                <EmptyTranscript />
              )}
              {audioUrl && <AudioPlayer src={audioUrl} />}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <IdleStart
          isModuleLoaded={isModuleLoaded}
          isLoading={isLoading}
          handleCircleClick={handleCircleClick}
        />
      )}
    </div>
  );
};

export default ElevenLabsConversation;

/* ------------------------------------------------------------------ */
/* sub‑components (same as before)                                    */
/* ------------------------------------------------------------------ */
const CallCircle: React.FC<{
  status: string;
  mode: string;
  isLoading: boolean;
  isModuleLoaded: boolean;
  handleCircleClick: () => void;
  handleTimerEnd: () => void;
}> = ({
  status,
  mode,
  isLoading,
  isModuleLoaded,
  handleCircleClick,
  handleTimerEnd,
}) => (
  <div
    className={`relative w-64 h-64 rounded-full flex items-center justify-center mx-auto ${
      !isLoading && isModuleLoaded
        ? "cursor-pointer transition-all duration-300"
        : ""
    }`}
    style={{
      background:
        "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
    onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
  >
    {status === "connected" && (
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
        <CountdownTimer
          durationMinutes={20}
          onEnd={handleTimerEnd}
          isActive={status === "connected"}
        />
      </div>
    )}

    <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div
        className={`bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border ${
          status === "connected" ? "border-accent" : "border-white/20"
        } transition-all`}
      >
        {!isModuleLoaded ? (
          <Loader text="Loading ElevenLabs…" />
        ) : isLoading ? (
          <Loader text="Connecting…" />
        ) : status === "connected" ? (
          <ActiveIndicator mode={mode} />
        ) : (
          <IdleIndicator />
        )}
      </div>
    </div>
  </div>
);

const CallFooter: React.FC<{
  status: string;
  mode: string;
  isLoading: boolean;
  isModuleLoaded: boolean;
}> = ({ status, mode, isLoading, isModuleLoaded }) => (
  <div className="mt-6 text-center">
    <p className="font-medium">
      {!isModuleLoaded
        ? "Loading ElevenLabs…"
        : status === "connected"
        ? `Agent is ${mode === "speaking" ? "speaking" : "listening"}`
        : isLoading
        ? "Connecting…"
        : "Tap to start a conversation"}
    </p>
    {status === "connected" && (
      <p className="text-sm text-muted-foreground mt-1">
        The session will automatically end in 20 minutes
      </p>
    )}
  </div>
);

/* ——— loader / indicators / bubbles / idle start (unchanged) ——— */
const Loader: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-white flex flex-col items-center">
    <svg
      className="w-12 h-12 animate-spin mb-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <span className="text-sm">{text}</span>
  </div>
);

const ActiveIndicator: React.FC<{ mode: string }> = ({ mode }) => (
  <div className={`text-white ${mode === "speaking" ? "animate-pulse" : ""}`}>
    <div className="flex flex-col items-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm mt-2">Active Call</span>
    </div>
  </div>
);

const IdleIndicator: React.FC = () => (
  <div className="text-white flex flex-col items-center">
    <Mic size={48} strokeWidth={1.5} />
    <span className="text-sm mt-2">Try a call</span>
  </div>
);

const EmptyTranscript: React.FC = () => (
  <div className="text-center py-12">
    <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
    <p className="font-medium">No conversation transcript yet</p>
    <p className="text-sm mt-1 text-muted-foreground">
      Start a conversation to see the transcript here
    </p>
  </div>
);

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => (
  <div className="mt-6 p-4 border rounded-lg">
    <div className="flex items-center space-x-2 mb-2">
      <Volume2 size={18} />
      <span className="font-medium">Audio Recording</span>
    </div>
    <audio className="w-full" controls src={src} />
  </div>
);

const MessageBubble: React.FC<{ message: any }> = ({ message }) => (
  <div
    className={`p-4 rounded-lg ${
      message.role === "ai"
        ? "bg-accent/20 border border-accent/20 ml-4"
        : "bg-primary/10 border border-primary/10 mr-4"
    }`}
  >
    <div className="flex items-center mb-2">
      <div
        className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
          message.role === "ai"
            ? "bg-accent text-accent-foreground"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {message.role === "ai" ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className="font-medium">
        {message.role === "ai" ? "Interview Coach" : "You"}
      </div>
      <div className="text-xs text-muted-foreground ml-auto">
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
    <p className="pl-10">{message.content}</p>
  </div>
);

const IdleStart: React.FC<{
  isModuleLoaded: boolean;
  isLoading: boolean;
  handleCircleClick: () => void;
}> = ({ isModuleLoaded, isLoading, handleCircleClick }) => (
  <div className="flex flex-col items-center">
    <div
      className={`relative w-64 h-64 rounded-full flex items-center justify-center ${
        !isLoading && isModuleLoaded
          ? "cursor-pointer transition-all duration-300 hover:scale-105"
          : ""
      }`}
      style={{
        background:
          "url('/lovable-uploads/305d576e-6a3f-4884-b0c6-6fb92372c26f.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={isModuleLoaded && !isLoading ? handleCircleClick : undefined}
    >
      <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex items-center justify-center border border-white/20">
          {!isModuleLoaded ? (
            <Loader text="Loading ElevenLabs…" />
          ) : isLoading ? (
            <Loader text="Connecting…" />
          ) : (
            <IdleIndicator />
          )}
        </div>
      </div>
    </div>

    <div className="mt-6 text-center">
      <p className="font-medium">
        {!isModuleLoaded
          ? "Loading ElevenLabs…"
          : isLoading
          ? "Connecting…"
          : "Tap to start a conversation"}
      </p>
      {isModuleLoaded && !isLoading && (
        <p className="text-sm text-muted-foreground mt-1">
          Your conversation will be saved for later review
        </p>
      )}
    </div>
  </div>
);
