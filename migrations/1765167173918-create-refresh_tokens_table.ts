import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefreshTokensTable1765167173918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE refresh_tokens (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          token_hash VARCHAR(255) NOT NULL,
          token_family VARCHAR(255) NOT NULL,
          issued_at TIMESTAMP NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          status VARCHAR(255) NOT NULL,

          CONSTRAINT fk_refresh_token_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE refresh_tokens;
      `);
  }
}
