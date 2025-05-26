
/// <reference types="vite/client" />

// Add type declarations for ElevenLabs Convai widget
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'agent-id'?: string;
    }, HTMLElement>;
  }
}
