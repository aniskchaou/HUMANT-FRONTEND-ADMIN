export default class DashboardAnalytics {
  bookNumber: string;
  memberNumber: string;
  issueBookNumber: string;
  categoryNumber: string;

  constructor(
    bookNumber: string,
    memberNumber: string,
    issueBookNumber: string,
    categoryNumber: string
  ) {
    this.bookNumber = bookNumber;
    this.memberNumber = memberNumber;
    this.issueBookNumber = issueBookNumber;
    this.categoryNumber = categoryNumber;
  }
}
