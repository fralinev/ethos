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
      // if you want stronger typing: this.redis.get<string>(sessionKey(sid))
      const data = await this.redis.get(sessionKey(sid));

      if (!data) {
        return cb(null, null);
      }

      let sess: session.SessionData;

      if (typeof data === "string") {
        // stored as JSON string
        sess = JSON.parse(data) as session.SessionData;
      } else {
        // already an object (or some other deserialized type)
        sess = data as session.SessionData;
      }

      cb(null, sess);
    } catch (err) {
      cb(err, undefined);
    }
  }

  override async set(
    sid: string,
    sess: session.SessionData,
    cb?: (err?: any) => void
  ) {
    try {
      await this.redis.set(sessionKey(sid), JSON.stringify(sess), {
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
