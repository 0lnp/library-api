import { Body, Controller, Inject, Post } from "@nestjs/common";
import { type LoginBodyDTO, type RegisterBodyDTO } from "../dtos/auth_dto";
import { AuthMapper } from "../mappers/auth_mapper";
import { UserRegisterService } from "src/application/services/user_register_service";
import { UserLoginService } from "src/application/services/user_login_service";

@Controller("auth")
export class AuthController {
  public constructor(
    @Inject(UserRegisterService.name)
    private readonly userRegisterService: UserRegisterService,
    @Inject(UserLoginService.name)
    private readonly userLoginService: UserLoginService,
  ) {}

  @Post("register")
  async postAuthRegister(@Body() body: RegisterBodyDTO) {
    const request = AuthMapper.toRegisterRequest(body);
    const result = await this.userRegisterService.execute(request);
    return AuthMapper.toRegisterResponse(result);
  }

  @Post("login")
  async postAuthLogin(@Body() body: LoginBodyDTO) {
    const request = AuthMapper.toLoginRequest(body);
    const result = await this.userLoginService.execute(request);
    return AuthMapper.toLoginResponse(result);
  }
}
