export default class Complain {
  id: number;
  complainBy: string;
  complainAgainst: string;
  complainTitle: string;
  complainDate: string;
  constructor(
    id: number,
    ComplainBy: string,
    ComplainAgainst: string,
    ComplainTitle: string,
    ComplainDate: string,
    Description: string
  ) {
    this.id = id;
    this.complainBy = ComplainBy;
    this.complainAgainst = ComplainAgainst;
    this.complainTitle = ComplainTitle;
    this.complainDate = ComplainDate;
    this.description = Description;
  }
  description: string;
}
