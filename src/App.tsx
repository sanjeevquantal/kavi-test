
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoryProvider } from "./contexts/StoryContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Edit from "./pages/Edit";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Practice from "./pages/Practice";
import Stories from "./pages/Stories";
import GeminiDashboard from "./pages/GeminiDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <StoryProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit/:id" element={<Edit />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/practice/:id" element={<Practice />} />
              <Route path="/gemini-dashboard" element={<GeminiDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StoryProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
