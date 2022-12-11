export default class BookCategoryAnalytics {
  books: string[];
  categories: string[];

  constructor(books: string[], categories: string[]) {
    this.books = books;
    this.categories = categories;
  }
}
