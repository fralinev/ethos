require('dotenv').config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { usersRouter } from "./routes/users";
import { authRouter } from './routes/auth';
import { chatsRouter } from './routes/chats';
import { profilesRouter } from './routes/profiles';
import { sessionMiddleware } from './session';
import { userSockets, chatSockets } from './ws/hub';
import { db } from './db';

const allowedOrigins = [
  "http://localhost:3000",
  "https://ethos.fralinev.dev"
];

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(helmet());
app.use(sessionMiddleware);
app.use(express.json({strict: false}));

app.get("/socket-maps", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    const userIds = [];
    const chatIds: Record<string, { id: string, username?: string }[]> = {};
    for (const [userId] of userSockets) {
      userIds.push(userId)
    }
    for (const [chatId, set] of chatSockets) {
      chatIds[chatId] = []
      for (const { user } of set) {
        if (user) {
          chatIds[chatId].push(user)

        }

      }
    }

    res.status(200).json({ userIds, chatIds })
  } else {
    res.sendStatus(404)
  }
})

app.get("/archived-chats", async (req, res) => {
  const data = (await db.query(`
    SELECT *
    FROM chats
    WHERE archived_at IS NOT NULL;`)).rows
  res.json(data)
} )

app.get('/health', (req, res) => res.sendStatus(200));


app.get('/', (_req, res) => {
  res.send('Ethos API is running');
});

app.use("/users", usersRouter);
app.use("/auth", authRouter)
app.use("/chats", chatsRouter)
app.use("/profiles", profilesRouter)

export default app;