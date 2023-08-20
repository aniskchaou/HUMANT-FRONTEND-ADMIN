import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class ResignationValidation {
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
      employeeName: new FormControl(''),
      departement: new FormControl(''),
      resignationDate: new FormControl(''),
      resignationReason: new FormControl(''),
      //pdf: new FormControl('', Validators.required),
      // link: new FormControl('', Validators.required),
    });
  }
}
