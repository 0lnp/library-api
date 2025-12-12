import { createClientPool } from "redis";
import { TokenBlacklistManager } from "src/domain/ports/token_blacklist_manager";
import { UserID } from "src/domain/value_objects/user_id";

export class RedisTokenBlacklistManager extends TokenBlacklistManager {
  public constructor(
    private readonly redisPool: ReturnType<typeof createClientPool>,
  ) {
    super();
  }

  public async blacklist(
    tokenHash: string,
    userID: UserID,
    expiresAt: Date,
  ): Promise<void> {
    const key = TokenBlacklistManager.TOKEN_PREFIX + tokenHash;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = Math.floor(expiresAt.getTime() / 1000);
    const ttlSeconds = expiresAtSeconds - nowInSeconds;

    await this.redisPool.set(key, userID.value, {
      expiration: {
        type: "EX",
        value: ttlSeconds,
      },
    });
  }

  public async isBlacklisted(tokenHash: string): Promise<boolean> {
    const key = TokenBlacklistManager.TOKEN_PREFIX + tokenHash;

    const result = await this.redisPool.exists(key);
    return result === 1;
  }
}
