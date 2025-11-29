import { IsEmail, IsString } from "class-validator";

export class AuthenticateDTO {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class AuthenticateResult {
  accessToken!: string;
  refreshToken!: string;
}
