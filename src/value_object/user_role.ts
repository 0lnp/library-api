import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { UserPermission } from "./user_permission";

export class UserRole {
  public constructor(
    public readonly name: string,
    public readonly permissions: UserPermission[],
  ) {
    this.validate();
  }

  private validate() {
    if (this.name === "") {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUserRole,
        message: "Name is required",
      });
    }

    if (this.permissions.length === 0) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUserRole,
        message: "Permissions are required",
      });
    }
  }

  public hasPermission(permission: UserPermission) {
    return this.permissions.find((p) => p === permission);
  }
}
