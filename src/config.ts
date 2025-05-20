interface Config {
  openAI: {
    apiKey: string;
    assistantId: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
}

// Get API key from environment variables
const config: Config = {
  openAI: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || "", // API key will be set in environment variables
    assistantId: process.env.REACT_APP_OPENAI_ASSISTANT_ID || "", // Assistant ID will be set in environment variables
  },
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || "",
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
  }
};

export default config; 