export type UserRow = {
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

export type ChatRow = {
  id: string;
  subject: string | null;
  created_by: string;
  created_at: string;
  archived_at: string;
  type: ChatType;
  // user_a_id: string;
  // user_b_id: string;
}

export type Member = {
  id: string;
  username: string;
  role: string;

}

export type ChatType = "direct" | "group";

export type MessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  username: string;
  content: string;
  created_at: string;
}

export type MessageDTO = {
  id: string;
  chatId: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  }
}