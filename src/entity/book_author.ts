import { ClassProps } from "src/shared/types/class_props";
import { BookAuthorID } from "src/value_object/book_author_id";

type BookAuthorProps = ClassProps<BookAuthor>;
type BookAuthorCreationProps = Omit<BookAuthorProps, "id">;

export class BookAuthor {
  public readonly id: BookAuthorID;
  public name: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(props: BookAuthorProps) {
    this.id = props.id;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate() {
    if (!this.name) {
      throw new Error("Name is required");
    }
  }

  public static create(props: BookAuthorCreationProps): BookAuthor {
    const id = BookAuthorID.generate();
    const now = new Date();
    return new BookAuthor({
      ...props,
      id,
      createdAt: now,
      updatedAt: now,
    });
  }
}
