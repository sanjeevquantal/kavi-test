
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set up Supabase client using env vars
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from the JWT token in the authorization header
    const token = authorization.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error('Error getting user from token:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`Fetching conversations for user: ${userId}`);

    // Fetch user conversation mappings from the database
    const { data: userConversations, error: mappingError } = await supabaseClient
      .from('user_conversations')
      .select('conversation_id')
      .eq('user_id', userId);

    if (mappingError) {
      console.error('Error fetching user conversation mappings:', mappingError);
      return new Response(
        JSON.stringify({ error: 'Database error', message: 'Failed to fetch user conversation mappings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no conversations are found, return an empty list
    if (!userConversations || userConversations.length === 0) {
      console.log('No conversations found for user');
      return new Response(
        JSON.stringify({ conversations: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract conversation IDs from the mappings
    const conversationIds = userConversations.map(uc => uc.conversation_id);
    console.log(`Found ${conversationIds.length} conversation IDs for user`);

    // Fetch the actual conversations from ElevenLabs API
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY') || '';
    if (!elevenLabsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration error', message: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the ElevenLabs API to get all conversations
    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations', {
      method: 'GET',
      headers: { 'xi-api-key': elevenLabsApiKey }
    });

    if (!response.ok) {
      console.error('Error from ElevenLabs API:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'External API error', message: 'Failed to fetch from ElevenLabs API' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const elevenlabsData = await response.json();
    
    // Filter the conversations to only include the ones associated with the user
    const userSpecificConversations = elevenlabsData.conversations.filter(
      (conversation: any) => conversationIds.includes(conversation.conversation_id)
    );

    console.log(`Returning ${userSpecificConversations.length} filtered conversations`);
    
    return new Response(
      JSON.stringify({ conversations: userSpecificConversations }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in get-user-conversations:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
