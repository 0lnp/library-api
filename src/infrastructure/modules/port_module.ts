import { Logger, Module } from "@nestjs/common";
import { BcryptPasswordHasher } from "../securities/bcrypt_password_hasher";
import { JoseTokenGenerator } from "../identities/jose_token_generator";
import { CryptoTokenHasher } from "../securities/crypto_token_hasher";
import { PasswordHasher } from "src/domain/ports/password_hasher";
import { TokenGenerator } from "src/domain/ports/token_generator";
import { TokenHasher } from "src/domain/ports/token_hasher";
import { TokenBlacklistManager } from "src/domain/ports/token_blacklist_manager";
import { RedisTokenBlacklistManager } from "../identities/redis_token_blacklist_management";
import { redisPool } from "../caches/redis_pool";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../configs/app_config";

@Module({
  providers: [
    {
      provide: PasswordHasher.name,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TokenGenerator.name,
      useClass: JoseTokenGenerator,
    },
    {
      provide: TokenHasher.name,
      useClass: CryptoTokenHasher,
    },
    {
      provide: TokenBlacklistManager.name,
      useFactory(config: ConfigService<AppConfig, true>) {
        const logger = new Logger(TokenBlacklistManager.name);
        const pool = redisPool(config, logger);
        return new RedisTokenBlacklistManager(pool);
      },
      inject: [ConfigService],
    },
  ],
  exports: [
    PasswordHasher.name,
    TokenGenerator.name,
    TokenHasher.name,
    TokenBlacklistManager.name,
  ],
})
export class PortModule {}
