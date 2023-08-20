export default class Termination {
  id: number;
  typeTermination: string;
  reason: string;
  notice: string;
  description: string;
  name: string;
  terminationDate: string;

  constructor(
    id: number,
    typeTermination: string,
    Reason: string,
    Notice: string,
    Description: string,
    Name: string,
    terminationDate: string
  ) {
    this.id = id;
    this.typeTermination = typeTermination;
    this.reason = Reason;
    this.notice = Notice;
    this.description = Description;
    this.name = Name;
    this.terminationDate = terminationDate;
  }
}
