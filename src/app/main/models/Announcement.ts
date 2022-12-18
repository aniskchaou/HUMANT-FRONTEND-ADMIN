export default class Announcement {
  id: number;
  Title: string;
  Department: string;
  StartDate: string;
  EndDate: string;
  Attachment: string;
  Summary: string;
  Description: string;

  constructor(
    id: number,
    Title: string,
    Department: string,
    StartDate: string,
    EndDate: string,
    Attachment: string,
    Summary: string,
    Description: string
  ) {
    this.id = id;
    this.Title = Title;
    this.Department = Department;
    this.StartDate = StartDate;
    this.EndDate = EndDate;
    this.Attachment = Attachment;
    this.Summary = Summary;
    this.Description = Description;
  }
}
