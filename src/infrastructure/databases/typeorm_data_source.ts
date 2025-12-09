import { type ConfigService } from "@nestjs/config";
import { type AppConfig } from "../configs/app_config";
import { DataSource, type DataSourceOptions } from "typeorm";
import { UserORMEntity } from "./orm_entities/user_orm_entity";
import { RefreshTokenORMEntity } from "./orm_entities/refresh_token_orm_entity";

export const typeORMDataSourceOptions = (
  config: ConfigService<AppConfig, true>,
): DataSourceOptions => ({
  type: "postgres",
  host: config.get("DATABASE_HOST", { infer: true }),
  port: config.get("DATABASE_PORT", { infer: true }),
  username: config.get("DATABASE_USER", { infer: true }),
  password: config.get("DATABASE_PASSWORD", { infer: true }),
  database: config.get("DATABASE_NAME", { infer: true }),
  entities: [UserORMEntity, RefreshTokenORMEntity],
});

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [UserORMEntity, RefreshTokenORMEntity],
  migrations: ["migrations/*.ts"],
  synchronize: false,
});
