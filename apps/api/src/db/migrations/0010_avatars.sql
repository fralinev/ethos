alter table users
  add column avatar_url text;

  alter table profiles
  drop column avatar_url;