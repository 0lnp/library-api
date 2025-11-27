import { ClassProps } from "src/shared/types/class_props";
import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { BookAvailability } from "src/value_object/book_availability";
import { BookID } from "src/value_object/book_id";
import { BookAuthorID } from "src/value_object/book_author_id";
import { BookPublisherID } from "src/value_object/book_publisher_id";
import { UserID } from "src/value_object/user_id";

type BookProps = ClassProps<Book>;
type BookCreateProps = Omit<BookProps, "id" | "createdAt" | "updatedAt">;

export class Book {
  public readonly id: BookID;
  public readonly title: string;
  public readonly authorID: BookAuthorID;
  public readonly publisherID: BookPublisherID;
  public readonly year: number;
  public readonly isbn: string;
  private _availability: BookAvailability;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: BookProps) {
    this.id = props.id;
    this.title = props.title;
    this.authorID = props.authorID;
    this.publisherID = props.publisherID;
    this.year = props.year;
    this.isbn = props.isbn;
    this._availability = props._availability;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate() {
    if (!this.title) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBook,
        message: "Book title is required",
      });
    }

    if (!this.year) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBook,
        message: "Book year is required",
      });
    }

    if (!this.isbn) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBook,
        message: "Book ISBN is required",
      });
    }
  }

  public static create(props: BookCreateProps): Book {
    const id = BookID.generate();
    const now = new Date();
    return new Book({
      ...props,
      id,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstruct(props: BookProps): Book {
    return new Book(props);
  }

  public get availability(): BookAvailability {
    return this._availability;
  }
}
