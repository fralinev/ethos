import { withTransaction } from "./withTransaction";
import * as chatRepo from "../repos/chat.repo"
import { getUsersById } from "../repos/user.repo";
import { broadcastToUsers } from "../ws/hub";
import { BadRequestError, HttpError } from "@ethos/shared";
import type { ChatDTO } from "@ethos/shared";
import { ChatRow, UserRow, Member, MessageDTO } from "../types/types";

export async function createChat({
  subject = null,
  requesterId,
  userIds
}: {
  subject: string | null;
  requesterId: string;
  userIds: string[]
}) {

  const allUserIds = [...new Set([...userIds, requesterId])]
  if (allUserIds.length > 7) {
    throw new BadRequestError("Group size exceeds limit")
  }

  const { chat, members } = await withTransaction<{ chat: ChatRow, members: UserRow[] }>(async (client) => {
    const members: UserRow[] = await getUsersById(allUserIds, client)
    if (members.length !== allUserIds.length) {
      throw new BadRequestError("User not found");
    }
    if (members.length < 2) {
      throw new BadRequestError("A chat must have at least 2 members");
    }
    const type = members.length === 2 ? "direct" : "group";
    const pair = type === "direct" ? members.map(m => m.id).sort() : [];
    const [userAId = null, userBId = null] = pair;
    const chat: ChatRow = await chatRepo.createChat({
      subject,
      requesterId,
      type,
      userAId,
      userBId
    }, client);

    for (let member of members) {
      await chatRepo.addMember({ chatId: chat.id, userId: member.id }, client);
    }
    return { chat, members };
  });

  const createdByMember = members.find((member) => member.id === requesterId);
  if (!createdByMember) {
    throw new BadRequestError("Requester not found in chat members");
  }

  const chatDTO: ChatDTO = {
    id: chat.id,
    subject: chat.subject,
    type: chat.type,
    createdAt: chat.created_at,
    createdBy: {
      id: createdByMember.id,
      username: createdByMember.username,
    },
    members: members.map((m) => ({
      id: m.id,
      username: m.username,
      role: m.role,
    })),
  };
  console.log("SERVER CHECK", members)
  broadcastToUsers(members.map(u => u.id), "chat:created", chatDTO);
  return chatDTO
}

export async function getChats(userId: string) {
  const chats = await chatRepo.getChatsByUserId(userId);
  if (chats.length === 0) return [];
  const memberRows = await chatRepo.getMembersByChatIds(chats.map(c => c.id))
  const chatMembership = new Map<string, Member[]>();
  for (let row of memberRows) {
    const { chat_id, ...member } = row
    const arr = chatMembership.get(chat_id);
    if (arr) arr.push(member);
    else chatMembership.set(chat_id, [member]);

  }
  const chatDTOs: ChatDTO[] = chats.map(chat => {
    const members = chatMembership.get(chat.id) ?? [];
    const createdByMember = members.find((member) => member.id === chat.created_by);
    if (!createdByMember) {
      throw new HttpError(500, "Chat creator missing from members");
    }

    return {
      id: chat.id,
      subject: chat.subject,
      type: chat.type,
      createdAt: chat.created_at,
      createdBy: {
        id: createdByMember.id,
        username: createdByMember.username,
      },
      members,
    };
  })
  return chatDTOs;
}

export async function getChatById(chatId: string, userId: string): Promise<ChatDTO> {
  const chat = await chatRepo.getChatByIdForUser(chatId, userId);
  if (!chat) {
    throw new HttpError(404, "Chat not found");
  }

  const memberRows = await chatRepo.getMembersByChatIds([chat.id]);
  const members = memberRows
    .filter((row) => row.chat_id === chat.id)
    .map(({ chat_id, ...member }) => member);

  const createdByMember = members.find((member) => member.id === chat.created_by);
  if (!createdByMember) {
    throw new HttpError(500, "Chat creator missing from members");
  }

  return {
    id: chat.id,
    subject: chat.subject,
    type: chat.type,
    createdAt: chat.created_at,
    createdBy: {
      id: createdByMember.id,
      username: createdByMember.username,
    },
    members,
  };
}

export async function getMessages(chatId: string, userId: string) {
  const messages = await chatRepo.getMessages(chatId, userId)
  const messageDTOs: MessageDTO[] = messages.map((m) => ({
    id: m.id,
    chatId: m.chat_id,
    body: m.content,
    createdAt: m.created_at,
    sender: {
      id: m.sender_id,
      username: m.username,
    },
  }));
  return messageDTOs;

}

export async function postMessage({ chatId, userId, content }: { chatId: string, userId: string, content: string }) {
  const { id: messageId } = await chatRepo.postMessage({ chatId, userId, content });
  const message = await chatRepo.getMessage(messageId)
  const userIds = await chatRepo.getMemberIds(chatId)

  const messageDTO = {
    id: message.id,
    chatId: message.chat_id,
    body: message.content,
    createdAt: message.created_at,
    sender: {
      id: message.sender_id,
      username: message.username,
    },
  };
  broadcastToUsers(userIds, "message:created", messageDTO);
  return messageDTO
}

export async function updateSubject({ chatId, oldSubject, newSubject, userId }:
  { chatId: string; oldSubject: string; newSubject: string; userId: string }) {
  const updatedChat = await chatRepo.updateSubject({ chatId, newSubject, userId })
  const userIds = await chatRepo.getMemberIds(chatId)
  broadcastToUsers(userIds, "chat:renamed", { chatId, changedBy: updatedChat.username, oldSubject, newSubject: updatedChat.subject });
  return updatedChat

}

export async function removeUserFromChat({ chatId, userId }: { chatId: string, userId: string }) {
  const result = await withTransaction(async (client) => {
    const lock = await client.query("SELECT id, type FROM chats WHERE id = $1 FOR UPDATE", [chatId]);
    if (lock.rows.length === 0) {
      throw new HttpError(404, "Chat doesn't exist");
    }
    if (lock.rows[0].type === "direct") {
      throw new HttpError(403, "Cannot leave a direct chat");
    }
    const removal = await chatRepo.removeMember({ chatId, userId }, client);
    console.log("CHECKK =============", removal, chatId, userId)

    if (removal.rowCount === 0) {
      throw new HttpError(403, "Failed to leave chat")
    }
    const members = await chatRepo.getMemberIds(chatId, client)
    if (members.length === 0) {
      await chatRepo.archiveChat(chatId, client)
    }
    return members
  })

  broadcastToUsers([...result, userId], "chat:left", {
    chatId,
    leftBy: userId,
  });
}
