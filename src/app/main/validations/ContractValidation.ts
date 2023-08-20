import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class ContractValidation {
  formGroup: FormGroup;

  public get formGroupInstance(): FormGroup {
    return this.formGroup;
  }

  constructor() {
    this.formGroup = this.createFormGroup();
  }

  public checkValidation() {
    if (this.formGroup.invalid) {
      return false;
    }
    return true;
  }

  createFormGroup() {
    return new FormGroup({
      employee: new FormControl(''),
      subject: new FormControl(''),
      contractValue: new FormControl(''),
      contractType: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      description: new FormControl(''),
      status: new FormControl(''),
      job: new FormControl(''),
      departement: new FormControl(''),
      salaryStructureType: new FormControl(''),
      workingSchedule: new FormControl(''),
    });
  }
}
