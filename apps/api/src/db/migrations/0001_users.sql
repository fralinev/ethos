create table if not exists users (
  id bigserial primary key,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  is_active boolean not null default true,
  role text not null default 'user'
);