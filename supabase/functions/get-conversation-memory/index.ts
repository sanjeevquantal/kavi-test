
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Error fetching user or user not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Getting memory for user: ${user.id}`);

    // First, check for cumulative summary
    console.log(`MEMORY FETCH: Checking for cumulative summary for user: ${user.id}`);
    const { data: cumulativeSummary, error: cumulativeError } = await supabase
      .from('cumulative_summaries')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (cumulativeError && cumulativeError.code !== 'PGRST116') {
      console.error('Error fetching cumulative summary:', cumulativeError);
      // Non-critical error, continue with fetching messages and individual summaries
    } else if (cumulativeSummary) {
      console.log('MEMORY FETCH: Found cumulative summary:', {
        id: cumulativeSummary.id,
        updated_at: cumulativeSummary.updated_at,
        summary_preview: cumulativeSummary.summary.substring(0, 50) + '...',
      });
    }

    // Fetch recent messages from the conversation_messages table
    console.log(`MEMORY FETCH: Retrieving recent messages for user: ${user.id}`);
    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return new Response(
        JSON.stringify({ error: 'Error fetching messages', details: messagesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`MEMORY FETCH: Found ${messages?.length || 0} messages for user ${user.id}`);

    // Fetch conversation summaries
    console.log(`MEMORY FETCH: Retrieving conversation summaries for user: ${user.id}`);
    const { data: summaries, error: summariesError } = await supabase
      .from('conversation_summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (summariesError) {
      console.error('Error fetching summaries:', summariesError);
      return new Response(
        JSON.stringify({ error: 'Error fetching summaries', details: summariesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`MEMORY FETCH: Found ${summaries?.length || 0} summaries for user ${user.id}`);
    if (summaries && summaries.length > 0) {
      console.log('MEMORY FETCH: First summary:', {
        id: summaries[0].id,
        conversation_id: summaries[0].conversation_id,
        summary_preview: summaries[0].summary.substring(0, 50) + '...',
      });
    }

    // Reverse the messages to get them in chronological order
    const chronologicalMessages = [...messages].reverse();

    // Build the memory string
    let memory = '';
    
    // Add cumulative summary to the memory if available - MAKE THIS MORE PROMINENT
    if (cumulativeSummary) {
      memory += "===================== IMPORTANT CONTEXT =====================\n";
      memory += "You have access to all previous conversations with this user. Here's a summary of everything you've discussed so far:\n\n";
      memory += cumulativeSummary.summary;
      memory += "\n\n";
      memory += "If the user asks about past conversations, refer to this summary. DO NOT say you don't have access to previous interactions.\n";
      memory += "===================== END IMPORTANT CONTEXT =====================\n\n";
      console.log(`MEMORY FETCH: Added cumulative summary to memory string with enhanced importance markers`);
    }
    
    // Add summaries to the memory
    if (summaries && summaries.length > 0) {
      memory += "Previous conversation summaries:\n\n";
      summaries.slice(0, 5).forEach((summary, index) => {
        memory += `Summary ${index + 1}: ${summary.summary}\n\n`;
      });
      memory += "\n";
    }
    
    // Add recent messages to the memory
    if (chronologicalMessages.length > 0) {
      memory += "Recent conversation history:\n\n";
      chronologicalMessages.forEach(msg => {
        const role = msg.source === 'user' ? 'User' : 'Assistant';
        memory += `${role}: ${msg.content}\n\n`;
      });
    }

    console.log(`MEMORY FETCH: Built memory string of length ${memory.length} characters`);
    if (memory.length > 0) {
      console.log(`MEMORY FETCH: Memory preview: ${memory.substring(0, 100)}...`);
    }

    // Include information about whether the memory contains a cumulative summary
    const hasCumulativeMemory = cumulativeSummary !== null;
    console.log(`MEMORY FETCH: Has cumulative memory: ${hasCumulativeMemory}`);

    return new Response(
      JSON.stringify({ 
        memory,
        messageCount: chronologicalMessages.length,
        summaryCount: summaries?.length || 0,
        hasCumulativeMemory,
        cumulativeSummary: cumulativeSummary ? cumulativeSummary.summary : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Internal error in get-conversation-memory:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
