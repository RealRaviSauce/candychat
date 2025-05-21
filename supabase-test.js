// Simple script to test Supabase connection
// Run with: node supabase-test.js

require('dotenv').config(); // Load environment variables

const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if credentials are available
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure you have these in your .env file:');
  console.error('REACT_APP_SUPABASE_URL');
  console.error('REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase key length:', supabaseKey.length, 'characters');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to insert a message
async function testInsert() {
  console.log('Attempting to insert test message...');
  
  const { data, error } = await supabase
    .from('chat_logs')
    .insert([
      {
        thread_id: 'test-thread-' + Date.now(),
        user_message: 'This is a test message',
        assistant_response: 'This is a test response',
        email: 'test@example.com'
      }
    ]);
    
  if (error) {
    console.error('Error inserting test message:');
    console.error(error);
    return false;
  }
  
  console.log('Test message inserted successfully!');
  return true;
}

// Test function to read messages
async function testRead() {
  console.log('Attempting to read messages...');
  
  const { data, error } = await supabase
    .from('chat_logs')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('Error reading messages:');
    console.error(error);
    return false;
  }
  
  console.log('Messages retrieved:', data.length);
  if (data.length > 0) {
    console.log('Sample message:', data[0]);
  } else {
    console.log('No messages found in the table');
  }
  
  return true;
}

// Run tests
async function runTests() {
  console.log('Testing Supabase connection...');
  
  try {
    const insertSuccess = await testInsert();
    const readSuccess = await testRead();
    
    if (insertSuccess && readSuccess) {
      console.log('All tests passed! Supabase is working correctly.');
    } else {
      console.log('Some tests failed. Check the error messages above.');
    }
  } catch (err) {
    console.error('Unexpected error during tests:');
    console.error(err);
  }
}

runTests(); 