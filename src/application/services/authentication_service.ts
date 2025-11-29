import { type UserRepository } from "src/domain/repositories/user_repository";
import { type AuthenticateDTO } from "../dtos/authenticate_dto";
import {
  type JoseTokenManager,
  type TokenGeneratePayload,
  TokenType,
} from "src/shared/utilities/jose_token_manager";

interface AuthenticateResult {
  accessToken: string;
  refreshToken: string;
}

export class AuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private jwtTokenManager: JoseTokenManager,
  ) {}

  public async authenticate(dto: AuthenticateDTO): Promise<AuthenticateResult> {
    const user = await this.userRepository.findOne({ emailAddress: dto.email });
    if (!user) throw new Error("Invalid email or password");

    const isPasswordValid = await user.login(dto.password);
    if (!isPasswordValid) throw new Error("Invalid email or password");

    const payload: TokenGeneratePayload = {
      sub: user.id,
      role: user.roleAssignment.role.name,
    };
    const accessToken = await this.jwtTokenManager.generate(
      payload,
      TokenType.ACCESS,
    );
    const refreshToken = await this.jwtTokenManager.generate(
      payload,
      TokenType.REFRESH,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
