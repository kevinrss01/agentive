-- Add screenshots table to store screenshot URLs linked to conversation messages
CREATE TABLE IF NOT EXISTS conversation_message_screenshots (
  id SERIAL PRIMARY KEY,
  conversation_message_id INTEGER NOT NULL,
  original_url TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_message_id) REFERENCES conversation_message(id) ON DELETE CASCADE
);

-- Add index for faster queries
CREATE INDEX idx_conversation_message_screenshots_message_id ON conversation_message_screenshots(conversation_message_id); 