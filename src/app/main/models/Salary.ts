export default class Salary {
  id: number;
  salaryName: string;
  basicSalary: string;
  totalSalary: string;
  medicalAllowance: string;
  conveyanceAllowance: string;
  constructor(
    id: number,
    SalaryName: string,
    BasicSalary: string,
    TotalSalary: string,
    MedicalAllowance: string,
    ConveyanceAllowance: string
  ) {
    this.id = id;
    this.salaryName = SalaryName;
    this.basicSalary = BasicSalary;
    this.totalSalary = TotalSalary;
    this.medicalAllowance = MedicalAllowance;
    this.conveyanceAllowance = ConveyanceAllowance;
  }
}
