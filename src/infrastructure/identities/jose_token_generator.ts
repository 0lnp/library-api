import { ConfigService } from "@nestjs/config";
import {
  type ClaimsForType,
  type PayloadForType,
  type TokenGenerator,
} from "src/domain/ports/token_generator";
import { type AppConfig } from "../configs/app_config";
import { jwtVerify, SignJWT } from "jose";
import { Inject } from "@nestjs/common";

export class JoseTokenGenerator implements TokenGenerator {
  public constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  public async generate<T extends "access" | "refresh">(
    payload: PayloadForType<T>,
    tokenType: T,
  ): Promise<string> {
    const secretStr = this.configService.get(
      tokenType === "access"
        ? "JWT_ACCESS_TOKEN_SECRET"
        : "JWT_REFRESH_TOKEN_SECRET",
      { infer: true },
    );
    const secret = new TextEncoder().encode(secretStr);
    const lifetime = this.configService.get(
      tokenType === "access"
        ? "JWT_ACCESS_TOKEN_LIFETIME"
        : "JWT_REFRESH_TOKEN_LIFETIME",
      { infer: true },
    );
    const { sub, ...remaing } = payload;

    const accessToken = new SignJWT(remaing)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(lifetime)
      .setSubject(sub)
      .sign(secret);

    return accessToken;
  }

  public async verify<T extends "access" | "refresh">(
    token: string,
    tokenType: T,
  ): Promise<ClaimsForType<T>> {
    const secretStr = this.configService.get(
      tokenType === "access"
        ? "JWT_ACCESS_TOKEN_LIFETIME"
        : "JWT_REFRESH_TOKEN_SECRET",
      { infer: true },
    );
    const secret = new TextEncoder().encode(secretStr);

    const { payload } = await jwtVerify<ClaimsForType<T>>(token, secret);
    return payload;
  }
}
