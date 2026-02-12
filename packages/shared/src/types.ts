export type Chat = {
  id: string;
  subject: string | null;
  type: ChatType;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  };
  members: User[];
};

export type ChatType = "direct" | "group";

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

export type SocketEventMap = {
  "chat:created": Chat;
  "message:created": Message;
  "chat:deleted": {
    chatId: string,
    subject: string,
    deletedBy: string
  };
  "chat:renamed": {
    chatId: string,
    changedBy: string,
    oldSubject: string,
    newSubject: string
  },
  "user:login": {
    username: string
  }
  "chat:left": {
    chatId: string;
    leftBy: string;
  }
};

export type SocketMessage = {
  [K in keyof SocketEventMap]: {
    type: K;
    payload: SocketEventMap[K];
  };
}[keyof SocketEventMap];

export type User = {
  id: string;
  username: string;
  created_at: string;
  role: string;
};

export type NewChat = {
  subject: string | null;
  userIds: string[];
};

export type ChatRow = {
  id: string;
  subject: string;
  type: string;
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

export type Profile = {
  fullName: string;
  avatarURL: string;
  bio: string;
}