
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the Google Generative AI API endpoints
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// Get the API key from environment, with fallback to hardcoded value for development only
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyAqJTv3XFdsAxMQIRicq3N_2Cq2fx1uZUg';

serve(async (req) => {
  console.log('Gemini Memory function called');
  console.log(`Using API key (first few chars): ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 5) + '...' : 'NOT SET'}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { action, userId, summaries, newSummary } = await req.json();
    console.log(`Action: ${action}, User ID: ${userId}`);
    
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Create a Supabase client with auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    console.log(`SUPABASE_URL exists: ${!!supabaseUrl}`);
    console.log(`SUPABASE_ANON_KEY exists: ${!!supabaseAnonKey}`);
    
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error fetching user or user not found:', userError);
      return new Response(
        JSON.stringify({ error: 'Error fetching user or user not found', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    console.log(`User authenticated: ${user.id}`);
    
    // Check if the provided userId matches the authenticated user
    if (userId && userId !== user.id) {
      console.error('User ID mismatch');
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'generate':
        return await handleGenerateCumulativeSummary(supabase, user.id, summaries, corsHeaders);
      case 'update':
        return await handleUpdateCumulativeSummary(supabase, user.id, newSummary, corsHeaders);
      case 'retrieve':
        return await handleRetrieveCumulativeSummary(supabase, user.id, corsHeaders);
      default:
        console.error('Invalid action specified');
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleGenerateCumulativeSummary(supabase, userId, summaries, corsHeaders) {
  console.log('Generating cumulative summary');
  
  try {
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0) {
      console.error('No summaries provided');
      return new Response(
        JSON.stringify({ error: 'No summaries provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Format the summaries for the prompt
    const formattedSummaries = summaries
      .map((summary, index) => `Summary ${index + 1}: ${summary.summary}`)
      .join('\n\n');
    
    // Prepare the Gemini API request
    const prompt = `
      You are an AI assistant tasked with creating a comprehensive cumulative summary of multiple conversation summaries.
      The goal is to create a concise yet thorough representation of all important information and context from past conversations.
      Only include factual information present in the summaries.
      Organize the information logically to create a cohesive picture of all past conversations.
      
      Here are the individual conversation summaries:
      
      ${formattedSummaries}
      
      Please create a cumulative summary that captures the essential information across all these conversations.
      Format your response as a well-structured paragraph without mentioning that this is a cumulative summary.
      Focus on providing context that would be useful for future conversations with this user.
    `;
    
    console.log(`Calling Gemini API to generate cumulative summary from ${summaries.length} summaries`);
    console.log('API Key present:', !!GEMINI_API_KEY);
    console.log('API Key value (first few chars):', GEMINI_API_KEY.substring(0, 5) + '...');
    console.log('Gemini API URL:', GEMINI_API_URL);
    
    if (!GEMINI_API_KEY) {
      console.error('Missing Gemini API key');
      return new Response(
        JSON.stringify({ error: 'Gemini API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Call the Gemini API with updated URL (beta version)
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ error: 'Error calling Gemini API', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const geminiResponse = await response.json();
    console.log('Received response from Gemini API:', JSON.stringify(geminiResponse).substring(0, 200) + '...');
    
    if (!geminiResponse.candidates || 
        geminiResponse.candidates.length === 0 || 
        !geminiResponse.candidates[0].content ||
        !geminiResponse.candidates[0].content.parts ||
        geminiResponse.candidates[0].content.parts.length === 0) {
      console.error('Invalid response format from Gemini API', JSON.stringify(geminiResponse));
      return new Response(
        JSON.stringify({ error: 'Invalid response format from Gemini API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const cumulativeSummary = geminiResponse.candidates[0].content.parts[0].text;
    console.log(`Generated cumulative summary: ${cumulativeSummary.substring(0, 100)}...`);
    
    // Store the cumulative summary in the database
    const { data: existingSummary, error: fetchError } = await supabase
      .from('cumulative_summaries')
      .select()
      .eq('user_id', userId)
      .single();
    
    console.log('Fetch existing summary result:', existingSummary ? 'Found' : 'Not found');
    if (fetchError) {
      console.log('Fetch error code:', fetchError.code);
      console.log('Fetch error details:', fetchError);
    }
    
    let dbOperation;
    let dbResult;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // No existing summary, insert new one
      console.log('No existing cumulative summary, inserting new record');
      dbOperation = supabase
        .from('cumulative_summaries')
        .insert({
          user_id: userId,
          summary: cumulativeSummary
        });
        
      dbResult = await dbOperation;
      console.log('Insert operation completed. Success:', !dbResult.error);
      if (dbResult.error) {
        console.error('Insert error details:', dbResult.error);
      } else {
        console.log('Insert result:', dbResult.data);
      }
    } else if (!fetchError) {
      // Update existing summary
      console.log('Updating existing cumulative summary');
      dbOperation = supabase
        .from('cumulative_summaries')
        .update({
          summary: cumulativeSummary,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      dbResult = await dbOperation;
      console.log('Update operation completed. Success:', !dbResult.error);
      if (dbResult.error) {
        console.error('Update error details:', dbResult.error);
      } else {
        console.log('Update result:', dbResult.data);
      }
    } else {
      // Other error occurred
      console.error('Error checking for existing summary:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: fetchError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const { error: dbError } = dbResult || {};
    if (dbError) {
      console.error('Error storing cumulative summary:', dbError);
      return new Response(
        JSON.stringify({ error: 'Error storing cumulative summary', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Cumulative summary successfully stored in database');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        cumulativeSummary 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGenerateCumulativeSummary:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleUpdateCumulativeSummary(supabase, userId, newSummary, corsHeaders) {
  console.log('Updating cumulative summary with new conversation');
  
  try {
    if (!newSummary) {
      console.error('No new summary provided');
      return new Response(
        JSON.stringify({ error: 'No new summary provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Retrieve the current cumulative summary
    const { data: existingSummaryData, error: fetchError } = await supabase
      .from('cumulative_summaries')
      .select('summary')
      .eq('user_id', userId)
      .single();
    
    console.log('Fetch existing summary for update result:', existingSummaryData ? 'Found' : 'Not found');
    if (fetchError) {
      console.log('Fetch error code for update:', fetchError.code);
      console.log('Fetch error details for update:', fetchError);
    }
    
    const existingSummary = fetchError ? null : existingSummaryData.summary;
    console.log('Existing summary retrieved:', existingSummary ? 'yes' : 'no');
    
    if (!GEMINI_API_KEY) {
      console.error('Missing Gemini API key');
      return new Response(
        JSON.stringify({ error: 'Gemini API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Prepare the Gemini API request
    const prompt = existingSummary 
      ? `
        You are an AI assistant tasked with updating a cumulative summary with new information from a recent conversation.
        
        Current cumulative summary:
        "${existingSummary}"
        
        New conversation summary to integrate:
        "${newSummary}"
        
        Please update the cumulative summary to incorporate any new relevant information from the recent conversation.
        The updated summary should be cohesive and well-structured, not just a concatenation of the two.
        Format your response as a single paragraph without mentioning that this is a cumulative summary.
      `
      : `
        You are an AI assistant tasked with creating an initial cumulative summary based on a conversation summary.
        
        Conversation summary:
        "${newSummary}"
        
        Please create a cumulative summary that captures the essential information from this conversation.
        Format your response as a well-structured paragraph without mentioning that this is a summary.
        Focus on providing context that would be useful for future conversations with this user.
      `;
    
    console.log('Calling Gemini API to update cumulative summary');
    console.log('API Key present for update:', !!GEMINI_API_KEY);
    
    // Call the Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.2,
          max_output_tokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error in update: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ error: 'Error calling Gemini API', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const geminiResponse = await response.json();
    console.log('Received update response from Gemini API:', 
                JSON.stringify(geminiResponse).substring(0, 200) + '...');
    
    if (!geminiResponse.candidates || 
        geminiResponse.candidates.length === 0 || 
        !geminiResponse.candidates[0].content ||
        !geminiResponse.candidates[0].content.parts ||
        geminiResponse.candidates[0].content.parts.length === 0) {
      console.error('Invalid response format from Gemini API during update', 
                   JSON.stringify(geminiResponse));
      return new Response(
        JSON.stringify({ error: 'Invalid response format from Gemini API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const updatedSummary = geminiResponse.candidates[0].content.parts[0].text;
    console.log(`Updated cumulative summary: ${updatedSummary.substring(0, 100)}...`);
    
    // Store the updated cumulative summary in the database
    let dbOperation;
    let dbResult;
    
    if (!existingSummary) {
      // No existing summary, insert new one
      console.log('No existing cumulative summary, inserting new record');
      dbOperation = supabase
        .from('cumulative_summaries')
        .insert({
          user_id: userId,
          summary: updatedSummary
        });
        
      dbResult = await dbOperation;
      console.log('Insert operation for update completed. Success:', !dbResult.error);
      if (dbResult.error) {
        console.error('Insert error details for update:', dbResult.error);
      } else {
        console.log('Insert result for update:', dbResult.data);
      }
    } else {
      // Update existing summary
      console.log('Updating existing cumulative summary');
      dbOperation = supabase
        .from('cumulative_summaries')
        .update({
          summary: updatedSummary,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      dbResult = await dbOperation;
      console.log('Update operation for summary completed. Success:', !dbResult.error);
      if (dbResult.error) {
        console.error('Update error details for summary:', dbResult.error);
      } else {
        console.log('Update result for summary:', dbResult.data);
      }
    }
    
    const { error: dbError } = dbResult || {};
    if (dbError) {
      console.error('Error storing updated cumulative summary:', dbError);
      return new Response(
        JSON.stringify({ error: 'Error storing updated cumulative summary', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Updated cumulative summary successfully stored in database');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        cumulativeSummary: updatedSummary 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleUpdateCumulativeSummary:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleRetrieveCumulativeSummary(supabase, userId, corsHeaders) {
  console.log('Retrieving cumulative summary');
  
  try {
    // Retrieve the current cumulative summary
    const { data, error } = await supabase
      .from('cumulative_summaries')
      .select('summary, updated_at')
      .eq('user_id', userId)
      .single();
    
    console.log('Retrieve operation completed. Success:', !error);
    if (error) {
      console.log('Retrieve error code:', error.code);
      console.log('Retrieve error details:', error);
    } else {
      console.log('Retrieved data:', data ? 'Found' : 'Not found');
    }
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No summary exists yet
        console.log('No cumulative summary exists for this user');
        return new Response(
          JSON.stringify({ 
            exists: false,
            message: 'No cumulative summary exists for this user yet' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('Error fetching cumulative summary:', error);
      return new Response(
        JSON.stringify({ error: 'Database error', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`Retrieved cumulative summary: ${data.summary.substring(0, 100)}...`);
    console.log(`Last updated at: ${data.updated_at}`);
    
    return new Response(
      JSON.stringify({ 
        exists: true,
        cumulativeSummary: data.summary,
        updatedAt: data.updated_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleRetrieveCumulativeSummary:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
