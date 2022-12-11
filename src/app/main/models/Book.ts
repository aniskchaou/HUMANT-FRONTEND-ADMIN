export default class Book {
  id: number;
  isbn: string;
  title: string;
  subtitle: string;
  writer: string;
  edition: string;
  edition_year: string;
  number_of_books: string;
  photo: string;
  physical_form: string;
  publisher: string;
  series: string;
  size: string;
  price: string;
  call_no: string;
  location: string;
  clue_page: string;
  editor: string;
  publishing_year: string;
  publication_place: string;
  number_of_pages: string;
  source_details: string;
  notes: string;
  pdf: string;
  link: string;
  category: string;

  constructor(
    id: number,
    isbn: string,
    title: string,
    subtitle: string,
    writer: string,
    edition: string,
    edition_year: string,
    number_of_books: string,
    photo: string,
    physical_form: string,
    publisher: string,
    series: string,
    size: string,
    price: string,
    call_no: string,
    location: string,
    clue_page: string,
    editor: string,
    publishing_year: string,
    publication_place: string,
    number_of_pages: string,
    source_details: string,
    notes: string,
    pdf: string,
    link: string,
    category: string
  ) {
    this.id = id;
    this.isbn = isbn;
    this.title = title;
    this.subtitle = subtitle;
    this.writer = writer;
    this.edition = edition;
    this.edition_year = edition_year;
    this.number_of_books = number_of_books;
    this.photo = photo;
    this.physical_form = physical_form;
    this.publisher = publisher;
    this.series = series;
    this.size = size;
    this.price = price;
    this.call_no = call_no;
    this.location = location;
    this.clue_page = clue_page;
    this.editor = editor;
    this.publishing_year = publishing_year;
    this.publication_place = publication_place;
    this.number_of_pages = number_of_pages;
    this.source_details = source_details;
    this.notes = notes;
    this.pdf = pdf;
    this.link = link;
    this.category = category;
  }
}
