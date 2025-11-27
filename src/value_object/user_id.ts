import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { generateEntityID, ID } from "src/shared/utils/generate_entity_id";

export class UserID {
  constructor(public readonly value: ID) {
    const validBookIDRegex = /^user:[a-z0-9]{16}:\d+$/;
    if (!validBookIDRegex.test(value)) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidUser,
        message: "Book ID must be a valid string",
      });
    }
    this.value = value as ID;
  }

  public static generate(): UserID {
    const id = generateEntityID("user");
    return new UserID(id);
  }
}
