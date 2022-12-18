export default class Termination {
  id: number;
  typeTermination: string;
  Reason: string;
  Notice: string;
  Description: string;
  Name: string;
  TerminationDate: string;

  constructor(
    id: number,
    typeTermination: string,
    Reason: string,
    Notice: string,
    Description: string,
    Name: string,
    TerminationDate: string
  ) {
    this.id = id;
    this.typeTermination = typeTermination;
    this.Reason = Reason;
    this.Notice = Notice;
    this.Description = Description;
    this.Name = Name;
    this.TerminationDate = TerminationDate;
  }
}
