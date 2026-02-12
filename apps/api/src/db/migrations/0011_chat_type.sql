alter table chats
  add column type text
  check (type in ('direct', 'group'));