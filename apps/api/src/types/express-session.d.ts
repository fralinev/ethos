import "express-session";

declare module "express-session" {
  interface SessionData {
    cookie: any
    userId?: string;
  }
}