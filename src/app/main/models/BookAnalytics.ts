export default class BookAnalytics {
  numberIssueBook: string[];
  days: string[];

  constructor(numberIssueBook: string[], days: string[]) {
    this.numberIssueBook = numberIssueBook;
    this.days = days;
  }
}
