export default class Complain {
  id: number;
  ComplainBy: string;
  ComplainAgainst: string;
  ComplainTitle: string;
  ComplainDate: string;
  constructor(
    id: number,
    ComplainBy: string,
    ComplainAgainst: string,
    ComplainTitle: string,
    ComplainDate: string,
    Description: string
  ) {
    this.id = id;
    this.ComplainBy = ComplainBy;
    this.ComplainAgainst = ComplainAgainst;
    this.ComplainTitle = ComplainTitle;
    this.ComplainDate = ComplainDate;
    this.Description = Description;
  }
  Description: string;
}
