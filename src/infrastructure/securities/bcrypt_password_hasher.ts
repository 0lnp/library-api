import * as bcrypt from "bcrypt";
import { type PasswordHasher } from "src/domain/ports/password_hasher";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";

export class BcryptPasswordHasher implements PasswordHasher {
  private static SALT_ROUNDS = 10;

  public async hash(plainPassword: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(
        plainPassword,
        BcryptPasswordHasher.SALT_ROUNDS,
        (err, hash) => {
          if (err !== undefined) {
            reject(
              new InfrastructureError({
                code: InfrastructureErrorCode.PASSWORD_HASHING_FAILED,
                message: err.message,
                stack: err.stack,
              }),
            );
          }

          resolve(hash);
        },
      );
    });
  }

  public async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, function (err, result) {
        if (err !== undefined) {
          reject(
            new InfrastructureError({
              code: InfrastructureErrorCode.PASSWORD_VERIFICATION_FAILED,
              message: err.message,
              stack: err.stack,
            }),
          );
        }
        resolve(result);
      });
    });
  }
}
