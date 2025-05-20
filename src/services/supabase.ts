import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to save chat message to Supabase
export const saveChatMessage = async (threadId: string, userMessage: string, botResponse: string, email: string = '') => {
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