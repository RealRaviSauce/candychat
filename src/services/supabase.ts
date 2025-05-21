import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client with error handling
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : { from: () => ({ insert: () => ({ data: null, error: new Error('Supabase not configured') }) }) } as any;

// Function to save chat message to Supabase
export const saveChatMessage = async (threadId: string, userMessage: string, botResponse: string, email: string = '') => {
  // Skip if no thread ID or Supabase isn't configured properly
  if (!threadId || !process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    console.log('Skipping Supabase save: Missing configuration or thread ID');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('chat_logs')
      .insert([
        { 
          thread_id: threadId,
          user_message: userMessage,
          assistant_response: botResponse,
          email
        }
      ]);
      
    if (error) {
      console.error('Error saving chat message:', error);
    }
    
    return data;
  } catch (err) {
    console.error('Error in saveChatMessage:', err);
    return null;
  }
}; 