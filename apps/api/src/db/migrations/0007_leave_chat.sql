ALTER TABLE chat_members
  ADD COLUMN left_at timestamptz;

ALTER TABLE chats
  ADD COLUMN archived_at timestamptz;