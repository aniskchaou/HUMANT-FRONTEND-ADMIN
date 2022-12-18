export default class Salary {
  id: number;
  SalaryName: string;
  BasicSalary: string;
  TotalSalary: string;
  MedicalAllowance: string;
  ConveyanceAllowance: string;
  constructor(
    id: number,
    SalaryName: string,
    BasicSalary: string,
    TotalSalary: string,
    MedicalAllowance: string,
    ConveyanceAllowance: string
  ) {
    this.id = id;
    this.SalaryName = SalaryName;
    this.BasicSalary = BasicSalary;
    this.TotalSalary = TotalSalary;
    this.MedicalAllowance = MedicalAllowance;
    this.ConveyanceAllowance = ConveyanceAllowance;
  }
}
