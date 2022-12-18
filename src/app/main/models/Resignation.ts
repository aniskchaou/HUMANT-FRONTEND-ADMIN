export default class Resignation {
  id: number;
  EmployeeName: string;
  departement: string;
  ResignationDate: string;
  ResignationReason: string;

  constructor(
    id: number,
    EmployeeName: string,
    departement: string,
    ResignationDate: string,
    ResignationReason: string
  ) {
    this.id = id;
    this.EmployeeName = EmployeeName;
    this.departement = departement;
    this.ResignationDate = ResignationDate;
    this.ResignationReason = ResignationReason;
  }
}
