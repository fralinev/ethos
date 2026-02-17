ALTER TABLE chats
ADD COLUMN user_a_id uuid,
ADD COLUMN user_b_id uuid;

CREATE UNIQUE INDEX unique_direct_pair
ON chats (user_a_id, user_b_id)
WHERE type = 'direct';