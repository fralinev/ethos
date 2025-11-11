-- Create users table (idempotent)
create table if not exists users (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);