import { Module } from "@nestjs/common";
import { RepositoryModule } from "./repository_module";
import { PortsModule } from "./ports_module";
import { UserRegisterService } from "src/application/services/user_register_service";
import { UserLoginService } from "src/application/services/user_login_service";

@Module({
  imports: [RepositoryModule, PortsModule],
  providers: [
    {
      provide: UserRegisterService.name,
      useClass: UserRegisterService,
    },
    {
      provide: UserLoginService.name,
      useClass: UserLoginService,
    },
  ],
  exports: [UserRegisterService.name, UserLoginService.name],
})
export class ApplicationServiceModule {}
