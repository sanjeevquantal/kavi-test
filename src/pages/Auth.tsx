
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchElevenLabsConversation } from '@/utils/elevenlabsHelper';

const Auth = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a conversation ID in the URL for testing
    const url = new URL(window.location.href);
    const conversationId = url.searchParams.get('conversation_id');
    
    if (conversationId) {
      console.log("Found conversation_id in URL, fetching details:", conversationId);
      // Call the API and log results (not affecting UI)
      fetchElevenLabsConversation(conversationId).then(data => {
        console.log("Conversation fetch complete");
      });
    }

    // If user is already authenticated via Supabase, redirect to home
    if (user) {
      navigate('/');
      return;
    }

    // Check for Supabase auth session from URL
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setAuthError(`Session error: ${error.message}`);
          return;
        }
        
        if (data?.session) {
          // User is authenticated
          refreshProfile().then(() => {
            toast.success(`Welcome back!`);
            navigate('/');
          }).catch(err => {
            console.error("Error refreshing profile:", err);
            toast.error("Error loading your profile");
          });
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        setAuthError(error?.message || "Authentication error");
      }
    };

    // Get error from URL if present
    const errorParam = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    if (errorParam) {
      setAuthError(`${errorParam}: ${errorDescription || 'Unknown error'}`);
    } else {
      checkSession();
    }
  }, [navigate, refreshProfile, user]);

  return (
    <Layout>
      <div className="max-w-md mx-auto py-10">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to KAVI</h1>
        
        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <p className="font-medium mb-1">Authentication Error</p>
            <p>{authError}</p>
          </div>
        )}
        
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Auth;
