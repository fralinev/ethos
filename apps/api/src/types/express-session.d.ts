import "express-session";

declare module "express-session" {
  interface SessionData {
    cookie: any
    user?: {
      id: number;
      username: string;
      role: string;
    };
  }
}