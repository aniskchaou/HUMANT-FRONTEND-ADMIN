import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class AnnouncementValidation {
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
      Title: new FormControl(''),
      Department: new FormControl(''),
      StartDate: new FormControl(''),
      EndDate: new FormControl(''),
      Attachment: new FormControl(''),
      Summary: new FormControl(''),
      Description: new FormControl(''),
    });
  }
}
