export default class RequestedBook {
  id: number;
  book: string;
  writer: string;
  ctegory: string;
  edition: string;
  note: string;
  member: string;

  constructor(
    id: number,
    book: string,
    writer: string,
    ctegory: string,
    edition: string,
    note: string,
    member: string
  ) {
    this.id = id;
    this.book = book;
    this.writer = writer;
    this.ctegory = ctegory;
    this.edition = edition;
    this.note = note;
    this.member = member;
  }
}
