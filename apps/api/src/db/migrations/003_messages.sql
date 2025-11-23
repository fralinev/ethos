create table if not exists messages (
  id bigserial primary key,

  chat_id bigint not null
    references chats(id)
    on delete cascade,

  sender_id bigint not null
    references users(id)
    on delete cascade,

  content text not null,

  created_at timestamptz not null default now()
);