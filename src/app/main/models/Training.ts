import Employee from './Employee';
import TypeTraining from './TypeTraining';

export default class Training {
  id: number;
  typetraining: TypeTraining;
  Name: string;
  Employee: Employee;
  StartDate: string;
  EndDate: string;
  Description: string;

  constructor(
    id: number,
    typetraining: TypeTraining,
    Name: string,
    Employee: Employee,
    StartDate: string,
    EndDate: string,
    Description: string
  ) {
    this.id = id;
    this.typetraining = typetraining;
    this.Name = Name;
    this.Employee = Employee;
    this.StartDate = StartDate;
    this.EndDate = EndDate;
    this.Description = Description;
  }
}
