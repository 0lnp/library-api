import { ClassProps } from "src/shared/types/class_props";
import { UserRole } from "src/value_object/user_role";
import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { UserID } from "src/value_object/user_id";

type UserProps = ClassProps<User>;
type UserCreateProps = Omit<ClassProps<User>, "id" | "createdAt" | "updatedAt">;

export class User {
  public readonly id: UserID;
  public readonly username: string;
  public readonly displayName: string;
  public roles: UserRole[];
  public readonly hashedPassword: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.displayName = props.displayName;
    this.roles = props.roles;
    this.hashedPassword = props.hashedPassword;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate() {
    if (!this.username)
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Username is required",
      });

    if (!this.displayName)
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Display name is required",
      });

    if (!this.roles.length)
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Roles is required",
      });

    if (!this.hashedPassword)
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Hashed password is required",
      });

    if (!this.createdAt)
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Created at is required",
      });

    if (!this.updatedAt)
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Updated at is required",
      });
  }

  public static create(props: UserCreateProps): User {
    const id = UserID.generate();
    const now = new Date();
    return new User({
      ...props,
      id,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstruct(props: UserProps): User {
    return new User(props);
  }
}
