import { createHash } from "node:crypto";
import { type TokenHasher } from "src/domain/ports/token_hasher";

export class CryptoTokenHasher implements TokenHasher {
  public async hash(token: string): Promise<string> {
    const Hash = createHash("sha256");
    return Promise.resolve(Hash.update(token).digest("hex"));
  }
}
