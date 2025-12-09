import { type RefreshToken } from "src/domain/aggregates/refresh_token";
import { type ORMEntity } from "src/shared/types/orm_entity";
import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";
import { UserORMEntity } from "./user_orm_entity";

@Entity("refresh_tokens")
export class RefreshTokenORMEntity implements ORMEntity<RefreshToken> {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", name: "user_id" })
  @ForeignKey(() => UserORMEntity, "id")
  public userID!: string;
  @Column({ type: "varchar", name: "token_hash" })
  public tokenHash!: string;
  @Column({ type: "varchar", name: "token_family" })
  public tokenFamily!: string;
  @Column({ type: "timestamp", name: "issued_at" })
  public issuedAt!: Date;
  @Column({ type: "timestamp", name: "expires_at" })
  public expiresAt!: Date;
  @Column({ type: "varchar" })
  public status!: string;
}
