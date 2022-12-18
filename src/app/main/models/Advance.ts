export default class Advance {
  id: number;
  reason: string;
  employeeName: string;
  amount: string;
  date: string;
  remarks: string;

  constructor(
    id: number,
    reason: string,
    employeeName: string,
    amount: string,
    date: string,
    remarks: string
  ) {
    this.id = id;
    this.reason = reason;
    this.employeeName = employeeName;
    this.amount = amount;
    this.date = date;
    this.remarks = remarks;
  }
}
