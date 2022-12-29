import Employee from './Employee';
import TypeTraining from './TypeTraining';

export default class Training {
  id: number;
  typetraining: TypeTraining;
  name: string;
  employee: Employee;
  startDate: string;
  endDate: string;
  description: string;

  constructor(
    id: number,
    typetraining: TypeTraining,
    name: string,
    employee: Employee,
    startDate: string,
    endDate: string,
    description: string
  ) {
    this.id = id;
    this.typetraining = typetraining;
    this.name = name;
    this.employee = employee;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
  }
}
