import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class ComplainValidation {
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
      ComplainBy: new FormControl(''),
      ComplainAgainst: new FormControl(''),
      ComplainTitle: new FormControl(''),
      ComplainDate: new FormControl(''),
      Description: new FormControl(''),
      // link: new FormControl('', Validators.required),
    });
  }
}
