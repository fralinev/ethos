// apps/api/src/server.ts
import app from './app';

const port = Number(process.env.PORT) ?? 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Ethos API listening on http://0.0.0.0:${port}`);
});