
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log the API key availability (not the actual key for security)
if (import.meta.env.VITE_ELEVENLABS_API_KEY) {
  console.log("ElevenLabs API key is configured");
} else {
  console.warn("ElevenLabs API key is missing - API calls will fail");
}

createRoot(document.getElementById("root")!).render(<App />);
