
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useStories } from '@/contexts/StoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { setWidgetContext, fetchElevenLabsConversation } from '@/utils/elevenlabsHelper';
import { toast } from 'sonner';
import ElevenLabsConversation from '@/components/ElevenLabsConversation';

const Index = () => {
  const { stories } = useStories();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMode, setActiveMode] = useState<'none' | 'delivery'>('none');
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>(undefined);

  const hasStories = stories.length > 0;
  
  // Check if user is logged in
  const isLoggedIn = !!user;

  // Check URL for a conversation ID parameter to debug
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const conversationId = queryParams.get('conversation_id');
    
    if (conversationId) {
      console.log("Found conversation_id in URL params, will fetch details after 10s delay:", conversationId);
      
      // Add 10-second delay before fetching
      const timerId = setTimeout(() => {
        console.log("Delay complete, now fetching conversation details for:", conversationId);
        fetchElevenLabsConversation(conversationId).then(data => {
          console.log("Index page: Conversation fetch complete after 10s delay");
        });
      }, 10000); // 10 seconds delay
      
      // Clean up timer if component unmounts before the timeout completes
      return () => clearTimeout(timerId);
    }
  }, [location]);

  // Automatically start voice design when user is logged in
  useEffect(() => {
    if (isLoggedIn && activeMode === 'none') {
      handleVoiceDesignClick();
    }
  }, [isLoggedIn]);

  const handleVoiceDesignClick = () => {
    setActiveMode('delivery');
    setWidgetContext('delivery');
    
    // If there are stories, let the user select one
    if (hasStories) {
      // Pick the most recently updated story
      const mostRecentStory = [...stories].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      setSelectedStoryId(mostRecentStory.id);
      toast.success(`Voice Design activated for "${mostRecentStory.title}"`, { 
        description: "Click on the circle to start or stop conversation"
      });
    } else {
      toast.success("Voice Design activated", { 
        description: "Click on the circle to start or stop conversation"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center py-10">
            <h2 className="text-3xl font-bold mb-6">Welcome to KAVI</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Crush your interviews — the smart way.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="mb-6"
            >
              Get Started
            </Button>
            
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent mt-4">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 text-primary" 
              >
                <path 
                  d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
          </div>
        ) : activeMode !== 'none' ? (
          <ElevenLabsConversation 
            type={activeMode} 
            onClose={() => setActiveMode('none')}
            storyId={selectedStoryId} 
          />
        ) : (
          <div className="flex justify-center items-center h-[80vh]">
            <div 
              onClick={handleVoiceDesignClick}
              className="w-64 h-64 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "url('/lovable-uploads/2066d0db-b75d-41b0-a9c1-9beb662e81df.png')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="bg-black/50 backdrop-blur-sm w-full h-full rounded-full flex flex-col items-center justify-center text-white">
                <div className="bg-white/10 backdrop-blur-md w-56 h-56 rounded-full flex flex-col items-center justify-center border border-white/20">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-lg font-medium mt-3">Try a call</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
