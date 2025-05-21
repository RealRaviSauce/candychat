import { supabase, saveChatMessage } from './supabase';

// Function to test if Supabase is properly connected
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Simple query to check connection
    const { data, error } = await supabase
      .from('chat_logs')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful!', data);
    return true;
  } catch (err) {
    console.error('Error testing Supabase connection:', err);
    return false;
  }
};

// Wrapper for saveChatMessage with enhanced logging
export const debugSaveChatMessage = async (
  threadId: string,
  userMessage: string,
  botResponse: string,
  email: string = ''
): Promise<any> => {
  console.log('Attempting to save chat message to Supabase...');
  console.log({
    threadId,
    userMessage: userMessage.substring(0, 20) + '...',
    botResponse: botResponse.substring(0, 20) + '...',
    email
  });
  
  try {
    const result = await saveChatMessage(threadId, userMessage, botResponse, email);
    
    if (result) {
      console.log('Message saved successfully!');
    } else {
      console.log('Message save returned null/undefined result');
    }
    
    return result;
  } catch (err) {
    console.error('Error in debugSaveChatMessage:', err);
    return null;
  }
}; 