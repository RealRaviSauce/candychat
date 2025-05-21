import OpenAI from 'openai';
import config from '../config';

// Initialize the OpenAI client with error handling
const openai = new OpenAI({
  apiKey: config.openAI.apiKey || 'dummy-key-for-init',
  dangerouslyAllowBrowser: true // Allow API key usage in browser - in production, use a backend proxy
});

// Keep track of thread IDs for conversations
let threadId: string | null = null;

// Initialize a new conversation thread
export const createThread = async () => {
  try {
    // Check if API key is configured
    if (!config.openAI.apiKey || config.openAI.apiKey === 'dummy-key-for-init') {
      console.warn('OpenAI API key not configured');
      return 'local-' + Date.now(); // Return a local placeholder ID
    }
    
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    // Instead of throwing error, return a local ID so UI doesn't break
    return 'error-' + Date.now();
  }
};

// Send a message to the assistant and get the response
export const sendMessageToAssistant = async (message: string): Promise<string> => {
  try {
    // Check if API key is configured
    if (!config.openAI.apiKey || config.openAI.apiKey === 'dummy-key-for-init') {
      console.warn('OpenAI API key not configured, returning mock response');
      return "This is a mock response because the OpenAI API key is not configured. Please set up the API key to get real responses.";
    }
    
    // Create a thread if one doesn't exist yet
    if (!threadId) {
      await createThread();
    }

    // Add the user message to the thread
    await openai.beta.threads.messages.create(
      threadId!,
      {
        role: 'user',
        content: message
      }
    );

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(
      threadId!,
      {
        assistant_id: config.openAI.assistantId
      }
    );

    // Poll for the run completion
    let runStatus = await openai.beta.threads.runs.retrieve(
      threadId!,
      run.id
    );

    // Wait until the run is completed
    while (runStatus.status !== 'completed') {
      // If it fails or times out, throw an error
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }
      
      // Wait a bit before checking again (polling)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the updated status
      runStatus = await openai.beta.threads.runs.retrieve(
        threadId!,
        run.id
      );
    }

    // Get the messages from the thread (including the assistant's response)
    const messages = await openai.beta.threads.messages.list(
      threadId!
    );

    // Find the most recent assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length > 0) {
      const latestMessage = assistantMessages[0];
      // Extract the text content
      if (latestMessage.content && latestMessage.content.length > 0) {
        const textContent = latestMessage.content[0];
        if (textContent.type === 'text') {
          return textContent.text.value;
        }
      }
    }
    
    return "Sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return "Sorry, there was an error communicating with the assistant. Please try again later.";
  }
}; 