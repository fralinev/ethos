// apps/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check (useful for verifying the server runs)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Example placeholder route group
app.get('/', (_req, res) => {
    console.log("checkk")
  res.send('Ethos API is running');
});

export default app;