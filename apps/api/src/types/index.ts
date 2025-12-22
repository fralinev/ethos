
export type Chat = {
  id: number;
  name: string;
  createdAt: string;
  createdBy: {
    id: number;
    username: string;
  } | null;
  members: {
    id: number;
    username: string;
  }[];
  newName?: string
};

export type Message = {
  clientId?: string
  optimistic?: boolean,
  id?: number;
  chatId: number;
  body: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
};

export type SocketEvents = {
  "chat:created": Chat;
  "message:created": Message;
  "chat:deleted": {
    chatId: number,
    name: string,
    deletedBy: string
  };
  "chat:renamed": {
    chatId: number,
    renamedBy: string,
    oldName: string,
    newName: string
  },
  "user:login": {
    username: string
  }
};