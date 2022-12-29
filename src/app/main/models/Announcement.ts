import Departement from './Departement';

export default class Announcement {
  id: number;
  title: string;
  department: Departement;
  startDate: string;
  endDate: string;
  attachment: string;
  summary: string;
  description: string;

  constructor(
    id: number,
    Title: string,
    Department: Departement,
    StartDate: string,
    EndDate: string,
    Attachment: string,
    Summary: string,
    Description: string
  ) {
    this.id = id;
    this.title = Title;
    this.department = Department;
    this.startDate = StartDate;
    this.endDate = EndDate;
    this.attachment = Attachment;
    this.summary = Summary;
    this.description = Description;
  }
}
