create table if not exists chats (
  id bigserial primary key,
  name text not null,
  created_by bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists chat_members (
  chat_id bigint not null references chats(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),

  primary key (chat_id, user_id)
);
