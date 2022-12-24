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
      reason: new FormControl('', Validators.required),
      noticeDate: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      terminationDate: new FormControl('', Validators.required),
    });
  }
}
