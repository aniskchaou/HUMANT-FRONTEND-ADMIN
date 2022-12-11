export default class EBook {
  id: number;
  isbn: string;
  name: string;
  edition: string;
  language: string;
  author: string;

  constructor(
    id: number,
    isbn: string,
    name: string,
    edition: string,
    language: string,
    author: string
  ) {
    this.id = id;
    this.isbn = isbn;
    this.name = name;
    this.edition = edition;
    this.language = language;
    this.author = author;
  }
}
