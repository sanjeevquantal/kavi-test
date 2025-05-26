


-- Create a table for storing conversation messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only view their own conversation messages
CREATE POLICY "Users can view their own conversation messages" 
  ON public.conversation_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to ensure users can only insert their own conversation messages
CREATE POLICY "Users can insert their own conversation messages" 
  ON public.conversation_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create an RPC function to insert conversation messages
-- This helps bypass TypeScript limitations until types are refreshed
CREATE OR REPLACE FUNCTION public.insert_conversation_message(
  p_user_id UUID,
  p_conversation_id TEXT,
  p_source TEXT,
  p_content TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.conversation_messages (user_id, conversation_id, source, content)
  VALUES (p_user_id, p_conversation_id, p_source, p_content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage of the function to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_conversation_message TO authenticated;

-- Create a table for storing conversation summaries (NEW)
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only view their own conversation summaries
CREATE POLICY "Users can view their own conversation summaries" 
  ON public.conversation_summaries 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to ensure users can only insert/update their own conversation summaries
CREATE POLICY "Users can insert their own conversation summaries" 
  ON public.conversation_summaries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation summaries" 
  ON public.conversation_summaries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create an RPC function to upsert conversation summaries
CREATE OR REPLACE FUNCTION public.upsert_conversation_summary(
  p_user_id UUID,
  p_conversation_id TEXT,
  p_summary TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.conversation_summaries (user_id, conversation_id, summary)
  VALUES (p_user_id, p_conversation_id, p_summary)
  ON CONFLICT (conversation_id) 
  DO UPDATE SET 
    summary = p_summary,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage of the function to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_conversation_summary TO authenticated;

