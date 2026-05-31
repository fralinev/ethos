import { Router } from "express";
import { db } from "../db";
import { broadcastToUsers } from "../ws/hub";
import type { NewChat, Chat, ChatDTO } from "@ethos/shared"
import * as chatService from "../services/chat.service"
import { HttpError } from "@ethos/shared";
import { DatabaseError } from "pg";
import type { ChatRow } from "../types/types";


export const chatsRouter = Router();

chatsRouter.post("/create", async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId || isNaN(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { body } = req;
    if (
      !body ||
      !Array.isArray(body.userIds) ||
      body.userIds.some((id: unknown) => typeof id !== "string")
    ) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const { subject, userIds }: { subject: string | undefined, userIds: string[] } = body;
    const chatDTO = await chatService.createChat({
      subject: typeof subject === "string" ? subject.trim() : null,
      requesterId,
      userIds
    })
    return res.status(201).json(chatDTO);

  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err instanceof DatabaseError && err.code === "23505") {
      return res.status(500).json({ error: "Direct chat already exists" })
    }
    console.error(err);
    return res.status(500).json({ error: "Unknown error" });
  }
});


chatsRouter.get("/", async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId || isNaN(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const chatDTOs: ChatDTO[] = await chatService.getChats(requesterId)
    return res.status(200).json(chatDTOs);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err)
    return res.status(500).json({ message: "Unknown" });
  }
});

chatsRouter.get("/:chatId", async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId || isNaN(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { chatId } = req.params;
    if (!chatId || isNaN(Number(chatId))) {
      return res.status(400).json({ error: "Invalid chatId" });
    }

    const chat = await chatService.getChatById(chatId, requesterId);
    return res.status(200).json(chat);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Unknown" });
  }
});

chatsRouter.get("/:chatId/messages", async (req, res) => {
  try {
    const requesterId = req.session.userId;
    if (!requesterId || isNaN(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { chatId } = req.params

    if (!chatId || isNaN(Number(chatId))) {
      return res.status(400).json({ error: "Invalid chatId" });
    }
    const messageDTOs = await chatService.getMessages(chatId, requesterId)

    return res.status(200).json(messageDTOs);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err)
    return res.status(500).json({ message: "Unknown" });
  }
});

chatsRouter.post("/:chatId/messages", async (req, res) => {
  try {

    const requesterId = req.session.userId;

    if (!requesterId || !Number.isInteger(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { params, body } = req;
    const { chatId } = params;

    if (!chatId || !Number.isInteger(Number(chatId))) {
      return res.status(400).json({ error: "Invalid chatId" });
    }

    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Invalid body" });
    }

    const { content } = body

    if (typeof content !== "string") {
      return res.status(400).json({ message: "Invalid content" });
    }

    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    if (trimmed.length > 4000) {
      return res.status(400).json({ message: "Content exceeds maximum length" });
    }

    const messageDTO = await chatService.postMessage({ chatId, userId: requesterId, content: trimmed })

    return res.status(201).json(messageDTO);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err)
    return res.status(500).json({ message: "Unknown" });
  }
});

chatsRouter.patch("/:chatId", async (req, res) => {
  try {

    const requesterId = req.session.userId;

    if (!requesterId || !Number.isInteger(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { params, body } = req;
    const { chatId } = params;

    if (!chatId || !Number.isInteger(Number(chatId))) {
      return res.status(400).json({ error: "Invalid chatId" });
    }

    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Invalid body" });
    }

    if (!Object.hasOwn(body, "subject") || !Object.hasOwn(body, "newSubject")) {
      return res.status(400).json({ error: "Body missing subject" });
    }

    const { subject: oldSubject, newSubject } = body

    const updatedChat = await chatService.updateSubject({ chatId, oldSubject, newSubject, userId: requesterId })

    return res.status(200).json(updatedChat);
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error(err)
    return res.status(500).json({ message: "Unknown" });
  }

})

chatsRouter.delete("/:chatId/members", async (req, res) => {
  try {

    const requesterId = req.session.userId;

    if (!requesterId || !Number.isInteger(Number(requesterId))) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { chatId } = req.params;

    if (!chatId || !Number.isInteger(Number(chatId))) {
      return res.status(400).json({ error: "Invalid chatId" });
    }

    await chatService.removeUserFromChat({ chatId, userId: requesterId })

    return res.status(200).json({message: "Success"})

  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err instanceof DatabaseError) {
      return res.status(500).json({ error: "Unknown database error" })
    }
    return res.status(500).json({ error: "Unknown" });
  }
});
