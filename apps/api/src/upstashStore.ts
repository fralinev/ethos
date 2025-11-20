import session from "express-session";
import type { Redis } from "@upstash/redis";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const SESSION_PREFIX = "sess:";

const sessionKey = (sid: string) => `${SESSION_PREFIX}${sid}`;

export class UpstashStore extends session.Store {
  private redis: Redis;

  constructor(redis: Redis) {
    super();
    this.redis = redis;
  }

  override async get(
    sid: string,
    cb: (err: any, session?: session.SessionData | null) => void
  ) {
    try {
      const data = await this.redis.get(sessionKey(sid));
      if (!data) {
        return cb(null, null);
      }
      let session: session.SessionData;
      if (typeof data === "string") {
        session = JSON.parse(data) as session.SessionData;
      } else {
        session = data as session.SessionData;
      }
      cb(null, session);
    } catch (err) {
      cb(err, undefined);
    }
  }

  override async set(
    sid: string,
    session: session.SessionData,
    cb?: (err?: any) => void
  ) {
    try {
      await this.redis.set(sessionKey(sid), JSON.stringify(session), {
        ex: ONE_DAY_SECONDS,
      });
      cb?.();
    } catch (err) {
      cb?.(err);
    }
  }

  override async destroy(sid: string, cb?: (err?: any) => void) {
    try {
      await this.redis.del(sessionKey(sid));
      cb?.();
    } catch (err) {
      cb?.(err);
    }
  }
}
