import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { generateEntityID, ID } from "src/shared/utils/generate_entity_id";

export class BookID {
  constructor(public readonly value: ID) {
    const validBookIDRegex = /^book:[a-z0-9]{16}:\d+$/;
    if (!validBookIDRegex.test(value)) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBook,
        message: "Book ID must be a valid string",
      });
    }
    this.value = value as ID;
  }

  public static generate(): BookID {
    const id = generateEntityID("book");
    return new BookID(id);
  }
}
