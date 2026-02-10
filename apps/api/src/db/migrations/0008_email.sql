


ALTER TABLE users
  ADD COLUMN email text;

create unique index users_email_idx
  on users(email)
  where email is not null;