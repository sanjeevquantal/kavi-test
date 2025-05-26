
declare module '@11labs/client' {
  export interface ConversationOptions {
    agentId: string;
    url?: string;
    overrides?: {
      agent?: {
        prompt?: {
          prompt: string;
        },
        firstMessage?: string;
        language?: string;
      },
      tts?: {
        voiceId?: string;
      }
    };
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
    onModeChange?: (mode: { mode: 'speaking' | 'listening' }) => void;
    onMessage?: (message: any) => void;
    clientTools?: Record<string, (params: any) => any>;
  }

  export class Conversation {
    static startSession(options: ConversationOptions): Promise<Conversation>;
    endSession(): Promise<void>;
    setVolume(options: { volume: number }): Promise<void>;
  }
}
