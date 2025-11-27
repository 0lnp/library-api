import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";

enum BookAvailabilityStatus {
  Available = "available",
  Borrowed = "borrowed",
}

export class BookAvailability {
  private _status: BookAvailabilityStatus;

  constructor(status: BookAvailabilityStatus) {
    this._status = status;
  }

  public get status(): BookAvailabilityStatus {
    return this._status;
  }

  public canBeBorrowed(): boolean {
    return this._status === BookAvailabilityStatus.Available;
  }

  public checkOut(): void {
    if (this._status === BookAvailabilityStatus.Available) {
      this._status = BookAvailabilityStatus.Borrowed;
    } else {
      throw new InvariantError({
        errorCode: InvariantErrorCode.BookNotAvailable,
        message: "Book is not available for checkout",
      });
    }
  }

  public returnBook(): void {
    if (this._status === BookAvailabilityStatus.Borrowed) {
      this._status = BookAvailabilityStatus.Available;
    } else {
      throw new InvariantError({
        errorCode: InvariantErrorCode.BookNotCheckedOut,
        message: "Book is not checked out",
      });
    }
  }
}
