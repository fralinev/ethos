create table if not exists users (
  id bigserial primary key,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  is_active boolean not null default true,
  role text not null default 'user'h
);

create table if not exists chats (
  id bigserial primary key,
  name text not null,
  created_by bigint not null,
  created_by_username text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_members (
  chat_id bigint not null references chats(id) on delete cascade,
  user_id bigint not null,
  username text not null,
  joined_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table if not exists messages (
  id bigserial primary key,
  chat_id bigint not null references chats(id) on delete cascade,
  sender_id bigint not null,
  sender_username text not null,
  content text not null,
  created_at timestamptz not null default now()
);