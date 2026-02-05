export type Chat = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  } | null;
  members: {
    id: string;
    username: string;
  }[];
  newName?: string
};

export type Message = {
  clientId?: string
  optimistic?: boolean,
  id?: string;
  chatId: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
};

export type SocketEvents = {
  "chat:created": Chat;
  "message:created": Message;
  "chat:deleted": {
    chatId: string,
    name: string,
    deletedBy: string
  };
  "chat:renamed": {
    chatId: string,
    renamedBy: string,
    oldName: string,
    newName: string
  },
  "user:login": {
    username: string
  }
};

export type User = {
  id: string;
  username: string;
  created_at: string;
  role: string;
};

export type NewChat = {
  chatName: string;
  selectedUsers: User[];
};

export type ChatRow = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
};

export type SessionData = {
  cookie: any;
  user?: {
    id: string;
    username: string;
    role: string;
  };
};



export type HealthPayload = {
  api: string;
  db: string;
  redis: string;
  ws: string;
};

export type SessionUser = {
  id: string;
  username: string;
  role: string;
};

export type AuthedSession =
  SessionData & {
    user: SessionUser
  }

export type ServerMessage = {
  id: string;
  chatId: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
};
export type OptimisticMessage = {
  clientId: string
  optimistic: boolean,
  chatId: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
};

export type ChatMessage = ServerMessage | OptimisticMessage;
