import { InvariantError, InvariantErrorCode } from "src/errors/invariant_error";
import { ClassProps } from "src/shared/types/class_props";
import { BookPublisherID } from "src/value_object/book_publisher_id";

type BookPublisherProps = ClassProps<BookPublisher>;
type BookPublisherCreationProps = Omit<
  BookPublisherProps,
  "id" | "createdAt" | "updatedAt"
>;

export class BookPublisher {
  public readonly id: BookPublisherID;
  public readonly name: string;
  public readonly address: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: BookPublisherProps) {
    this.id = props.id;
    this.name = props.name;
    this.address = props.address;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate() {
    if (!this.name) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBookPublisher,
        message: "Name is required",
      });
    }

    if (!this.address) {
      throw new InvariantError({
        errorCode: InvariantErrorCode.InvalidBookPublisher,
        message: "Address is required",
      });
    }
  }

  public static create(props: BookPublisherCreationProps): BookPublisher {
    const id = BookPublisherID.generate();
    const now = new Date();
    return new BookPublisher({
      ...props,
      id,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstruct(props: BookPublisherProps): BookPublisher {
    return new BookPublisher(props);
  }
}
