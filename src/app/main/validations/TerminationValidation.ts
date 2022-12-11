import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class TerminationValidation {
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
      typeTermination: new FormControl('', Validators.required),
      Reason: new FormControl('', Validators.required),
      Notice: new FormControl('', Validators.required),
      Description: new FormControl('', Validators.required),
      Name: new FormControl('', Validators.required),
      TerminationDate: new FormControl('', Validators.required),
    });
  }
}
