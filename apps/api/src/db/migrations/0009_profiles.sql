create table profiles (
  user_id bigint primary key references users(id) on delete cascade,

  full_name text,  
  avatar_url text,
  bio text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);