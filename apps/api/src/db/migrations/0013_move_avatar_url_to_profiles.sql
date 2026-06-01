ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

UPDATE profiles p
SET avatar_url = u.avatar_url
FROM users u
WHERE p.user_id = u.id;

ALTER TABLE users DROP COLUMN avatar_url;