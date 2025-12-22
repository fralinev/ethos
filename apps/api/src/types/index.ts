
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