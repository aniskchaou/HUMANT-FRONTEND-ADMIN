export default class Resignation {
  id: number;
  employeeName: string;
  departement: string;
  resignationDate: string;
  resignationReason: string;

  constructor(
    id: number,
    employeeName: string,
    departement: string,
    ResignationDate: string,
    ResignationReason: string
  ) {
    this.id = id;
    this.employeeName = employeeName;
    this.departement = departement;
    this.resignationDate = ResignationDate;
    this.resignationReason = ResignationReason;
  }
}
