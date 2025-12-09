import { type User } from "src/domain/aggregates/user";
import { type ORMEntity } from "src/shared/types/orm_entity";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("users")
export class UserORMEntity implements ORMEntity<User> {
  @PrimaryColumn()
  public id!: string;
  @Column({ type: "varchar", length: 100, name: "display_name" })
  public displayName!: string;
  @Column({ type: "varchar", length: 100, unique: true })
  public email!: string;
  @Column({ type: "varchar", name: "password_hash" })
  public passwordHash!: string;
  @Column({ type: "varchar", name: "role_name" })
  public roleName!: string;
  @Column({ type: "timestamp", nullable: true, name: "last_login_at" })
  public lastLoginAt!: Date | null;
  @Column({ type: "timestamp", name: "registered_at" })
  public registeredAt!: Date;
}
