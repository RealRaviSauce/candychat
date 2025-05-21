import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createThread, sendMessageToAssistant } from '../services/openai';
import { saveChatMessage } from '../services/supabase';

// Message type definition
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

// Styled Components
const ChatContainer = styled.div`
  width: calc(100% - 40px);
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 80vh;
  border-radius: 0px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  background-color: #1a1a1a;
`;

const ChatHeader = styled.div`
  background-color: #FFEC19;
  color: #1a1a1a;
  padding: 15px 20px;
  border-radius: 0px;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
`;

const BotAvatar = styled.div`
  width: 30px;
  height: 30px;
  background-color: #1a1a1a;
  border-radius: 0px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #FFEC19;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #fff;
`;

const MessageBubble = styled.div<{ sender: 'user' | 'bot' }>`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 0px;
  margin-bottom: 10px;
  align-self: ${props => props.sender === 'user' ? 'flex-end' : 'flex-start'};
  background-color: ${props => props.sender === 'user' ? '#FFEC19' : '#333'};
  color: ${props => props.sender === 'user' ? '#1a1a1a' : '#fff'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

const InputForm = styled.form`
  display: flex;
  padding: 15px;
  background-color: #252525;
  border-radius: 0px;
  border-top: 1px solid #333;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #444;
  border-radius: 0px;
  outline: none;
  font-size: 16px;
  background-color: #333;
  color: #fff;
  &:focus {
    border-color: #FFEC19;
  }
`;

const SendButton = styled.button`
  background-color: #FFEC19;
  color: #1a1a1a;
  border: none;
  border-radius: 0px;
  width: 40px;
  height: 40px;
  margin-left: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e8d917;
  }
  
  &:disabled {
    background-color: #444;
    color: #666;
    cursor: not-allowed;
  }
`;

// Loading indicator for waiting for AI response
const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  align-self: flex-start;
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  margin: 0 1px;
  background-color: #FFEC19;
  border-radius: 0px;
  animation: typing 1.4s infinite both;
  
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 0.7; }
  }
`;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hii! I'm Candy, here to help you with your project details. To start please provide your full name and email.", sender: 'bot' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize the OpenAI thread
  useEffect(() => {
    const initThread = async () => {
      try {
        const newThreadId = await createThread();
        setThreadId(newThreadId);
      } catch (error) {
        console.error('Failed to initialize chat thread:', error);
      }
    };
    
    initThread();
  }, []);
  
  // Auto-scroll disabled
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '' || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Get response from the OpenAI assistant
      const response = await sendMessageToAssistant(newMessage);
      
      // Add bot response
      const botMessage: Message = {
        id: messages.length + 2,
        text: response,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Check if the message contains an email (simple check, you might want to improve this)
      if (newMessage.includes('@') && !userEmail) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
        const match = newMessage.match(emailRegex);
        if (match && match[0]) {
          setUserEmail(match[0]);
        }
      }
      
      // Save message to Supabase (wrapped in try/catch to prevent UI errors)
      try {
        if (threadId) {
          await saveChatMessage(threadId, newMessage, response, userEmail);
        }
      } catch (saveError) {
        console.error('Failed to save to Supabase:', saveError);
        // Continue UI flow even if saving fails
      }
    } catch (error) {
      console.error('Error getting response from assistant:', error);
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ChatContainer>
      <ChatHeader>
        <BotAvatar>C</BotAvatar>
        Candy
      </ChatHeader>
      <MessagesContainer>
        {messages.map(message => (
          <MessageBubble key={message.id} sender={message.sender}>
            {message.text}
          </MessageBubble>
        ))}
        {isLoading && (
          <TypingIndicator>
            <TypingDot />
            <TypingDot />
            <TypingDot />
          </TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputForm onSubmit={handleSendMessage}>
        <MessageInput
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={newMessage.trim() === '' || isLoading}>
          →
        </SendButton>
      </InputForm>
    </ChatContainer>
  );
};

export default Chat; 