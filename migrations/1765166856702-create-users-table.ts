import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1765166856702 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE users (
          id VARCHAR(255) PRIMARY KEY,
          display_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role_name VARCHAR(255) NOT NULL,
          last_login_at TIMESTAMP,
          registered_at TIMESTAMP
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE users;
      `);
  }
}
