import { Module } from "@nestjs/common";
import { BcryptPasswordHasher } from "../securities/bcrypt_password_hasher";
import { JoseTokenGenerator } from "../identities/jose_token_generator";
import { CryptoTokenHasher } from "../securities/crypto_token_hasher";
import { PasswordHasher } from "src/domain/ports/password_hasher";
import { TokenGenerator } from "src/domain/ports/token_generator";
import { TokenHasher } from "src/domain/ports/token_hasher";

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
  ],
  exports: [PasswordHasher.name, TokenGenerator.name, TokenHasher.name],
})
export class PortsModule {}
