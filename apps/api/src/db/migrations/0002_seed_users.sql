insert into users (name, email) values
  ('Ada Lovelace', 'ada@example.com'),
  ('Alan Turing', 'alan@example.com'),
on conflict (email) do nothing;
