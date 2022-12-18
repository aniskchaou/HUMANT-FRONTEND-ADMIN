import AwardType from './AwardType';
import Employee from './Employee';

export default class Award {
  id: number;
  employeeName: Employee;
  awardType: AwardType;
  awardDate: string;
  description: string;

  constructor(
    id: number,
    employeeName: Employee,
    awardType: AwardType,
    awardDate: string,
    description: string
  ) {
    this.id = id;
    this.employeeName = employeeName;
    this.awardType = awardType;
    this.awardDate = awardDate;
    this.description = description;
  }
}
