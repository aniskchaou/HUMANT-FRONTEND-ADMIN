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
      CertificateLevel: new FormControl(''),
      FieldofStudy: new FormControl(''),
      School: new FormControl(''),
      // Description: new FormControl(''),
    });
  }
}