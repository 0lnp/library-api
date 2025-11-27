import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";

export enum UserPermissionAction {
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

export class UserPermission {
  public constructor(
    public readonly resource: string,
    public readonly action: UserPermissionAction,
  ) {
    this.validate();
  }

  private validate() {
    if (this.resource === "") {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUserPermission,
        message: "Resource is required",
      });
    }
  }
}
