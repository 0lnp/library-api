import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { generateEntityID, ID } from "src/shared/utils/generate_entity_id";

export class BookAuthorID {
  private constructor(public readonly value: ID) {
    const validBookAuthorIDRegex = /^book_author:[a-z0-9]{16}:\d+$/;
    if (!validBookAuthorIDRegex.test(value)) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBookAuthor,
        message: "Book AuthorID is invalid",
      });
    }
    this.value = value as ID;
  }

  public static generate(): BookAuthorID {
    const id = generateEntityID("book_author");
    return new BookAuthorID(id);
  }
}
