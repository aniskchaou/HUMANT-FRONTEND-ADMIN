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
      title: new FormControl(''),
      department: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      attachment: new FormControl(''),
      summary: new FormControl(''),
      description: new FormControl(''),
    });
  }
}
