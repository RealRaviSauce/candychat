-- Create table for chat logs
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id TEXT NOT NULL,
  user_message TEXT,
  assistant_response TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_logs_thread_id_idx ON chat_logs(thread_id);
CREATE INDEX IF NOT EXISTS chat_logs_email_idx ON chat_logs(email);

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from client
CREATE POLICY "Allow inserts from client" ON chat_logs
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Create policy to allow reads 
CREATE POLICY "Allow reads" ON chat_logs
  FOR SELECT TO authenticated, anon
  USING (true); 