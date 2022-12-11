import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class SalaryValidation {
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
      SalaryName: new FormControl(''),
      BasicSalary: new FormControl(''),
      TotalSalary: new FormControl(''),
      MedicalAllowance: new FormControl(''),
      ConveyanceAllowance: new FormControl(''),
      // link: new FormControl('', Validators.required),
    });
  }
}
