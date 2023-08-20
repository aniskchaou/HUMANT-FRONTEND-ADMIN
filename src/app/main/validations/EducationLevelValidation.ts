import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class TrainingValidation {
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
      name: new FormControl(''),
      years: new FormControl(''),
      certificateLevel: new FormControl(''),
      fieldofStudy: new FormControl(''),
      school: new FormControl(''),
      // Description: new FormControl(''),
    });
  }
}
