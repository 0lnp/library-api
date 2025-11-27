import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { generateEntityID, ID } from "src/shared/utils/generate_entity_id";

export class BookPublisherID {
  public constructor(public readonly value: ID) {
    const validBookPublisherIDRegex = /^book_publisher:[a-z0-9]{16}:\d+$/;
    if (!validBookPublisherIDRegex.test(value)) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBookPublisher,
        message: "Book PublisherID is invalid",
      });
    }
    this.value = value as ID;
  }

  public static generate(): BookPublisherID {
    const id = generateEntityID("book_publisher");
    return new BookPublisherID(id);
  }
}
