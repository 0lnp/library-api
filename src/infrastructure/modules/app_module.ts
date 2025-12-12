import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppConfigSchema } from "../configs/app_config";
import { APP_FILTER } from "@nestjs/core";
import { ControllerModule } from "./controller_module";
import { GlobalExceptionFilter } from "../http/filters/global_exception_filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate(config: Record<string, unknown>) {
        return AppConfigSchema.parse(config);
      },
      isGlobal: true,
    }),
    ControllerModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
