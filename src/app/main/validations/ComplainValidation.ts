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
      complainBy: new FormControl(''),
      complainAgainst: new FormControl(''),
      complainTitle: new FormControl(''),
      complainDate: new FormControl(''),
      description: new FormControl(''),
      // link: new FormControl('', Validators.required),
    });
  }
}
