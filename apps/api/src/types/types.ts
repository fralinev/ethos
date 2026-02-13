export type dbUserRow = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  is_active: string;
  role: string;
  email:string;
  avatar_url: string;
}