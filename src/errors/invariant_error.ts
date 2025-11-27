export enum InvariantErrorCode {
  InvalidUserPermission = "INVALID_USER_PERMISSION",
  InvalidUserRole = "INVALID_USER_ROLE",
  InvalidUser = "INVALID_USER",
  InvalidBook = "INVALID_BOOK",
  InvalidBookPublisher = "INVALID_BOOK_PUBLISHER",
  InvalidBookAuthor = "INVALID_BOOK_AUTHOR",
  BookNotAvailable = "BOOK_NOT_AVAILABLE",
  BookNotCheckedOut = "BOOK_NOT_CHECKED_OUT",
}

interface InvariantErrorProps {
  errorCode: InvariantErrorCode;
  message: string;
}

export class InvariantError extends Error {
  public readonly errorCode: InvariantErrorCode;

  public constructor(props: InvariantErrorProps) {
    super(props.message);
    this.errorCode = props.errorCode;
    this.name = this.constructor.name;
  }
}
