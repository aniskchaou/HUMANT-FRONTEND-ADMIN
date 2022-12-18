export default class Notice {
  id: number;
  NoticeTitle: string;
  StartDate: string;
  EndDate: string;
  NoticeNote: string;

  constructor(
    id: number,
    NoticeTitle: string,
    StartDate: string,
    EndDate: string,
    NoticeNote: string
  ) {
    this.id = id;
    this.NoticeTitle = NoticeTitle;
    this.StartDate = StartDate;
    this.EndDate = EndDate;
    this.NoticeNote = NoticeNote;
  }
}
