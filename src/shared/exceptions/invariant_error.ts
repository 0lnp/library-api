import { type BaseErrorProps } from "src/shared/types/base_error_props";

export enum InvariantErrorCode {
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
  INVALID_PASSWORD_FORMAT = "INVALID_PASSWORD_FORMAT",
  ROTATION_NOT_PERMITTED = "ROTATION_NOT_PERMITTED",
  REVOCATION_NOT_PERMITTED = "REVOCATION_NOT_PERMITTED",
  ROLE_ASSIGNMENT_FAILED = "ROLE_ASSIGNMENT_FAILED",
}

export class InvariantError extends Error {
  public readonly code: InvariantErrorCode;

  constructor(props: BaseErrorProps<InvariantError>) {
    super(props.message);
    this.code = props.code;
    this.name = this.constructor.name;
  }
}
