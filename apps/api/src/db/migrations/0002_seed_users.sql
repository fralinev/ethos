insert into users (name, email) values
  ('Ada Lovelace', 'ada@example.com'),
  ('Alan Turing', 'alan@example.com'),
  ('Grace Hopper', 'grace@example.com'),
  ('Edsger Dijkstra', 'edsger@example.com'),
  ('Donald Knuth', 'donald@example.com'),
  ('Barbara Liskov', 'barbara@example.com'),
  ('Linus Torvalds', 'linus@example.com'),
  ('Guido van Rossum', 'guido@example.com'),
  ('Margaret Hamilton', 'margaret@example.com'),
  ('Tim Berners-Lee', 'tim@example.com')
on conflict (email) do nothing;
