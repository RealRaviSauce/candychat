import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Chat from './components/Chat';
import config from './config';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  padding: 20px;
`;

const ApiKeyWarning = styled.div`
  background-color: #333;
  color: #FFEC19;
  padding: 10px 15px;
  border-radius: 0px;
  margin-bottom: 20px;
  max-width: 600px;
  text-align: center;
  border: 1px solid #FFEC19;
`;

function App() {
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(true);

  useEffect(() => {
    // Check if the API key is properly configured
    if (
      !config.openAI.apiKey || 
      config.openAI.apiKey === 'your-openai-api-key-here' ||
      !config.openAI.assistantId ||
      config.openAI.assistantId === 'your-assistant-id-here'
    ) {
      setIsApiKeyConfigured(false);
    }
  }, []);

  return (
    <AppContainer>
      {!isApiKeyConfigured && (
        <ApiKeyWarning>
          Please configure your OpenAI API key and Assistant ID in the config.ts file.
        </ApiKeyWarning>
      )}
      
      <Chat />
    </AppContainer>
  );
}

export default App;
