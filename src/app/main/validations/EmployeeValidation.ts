import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export default class EmployeeValidation {
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
      fullName: new FormControl(''),
      phone: new FormControl(''),
      birthday: new FormControl(''),
      gender: new FormControl(''),
      presentAddress: new FormControl(''),
      permanentAddress: new FormControl(''),
      photo: new FormControl(''),
      note: new FormControl(''),
      departement: new FormControl(''),
      job: new FormControl(''),
      joiningDate: new FormControl(''),
      salary: new FormControl(''),
      emergencyContactNumber: new FormControl(''),
      contactNumber: new FormControl(''),
      contactNote: new FormControl(''),
      resume: new FormControl(''),
      offerLetter: new FormControl(''),
      contractAgreement: new FormControl(''),
      identityProof: new FormControl(''),
      contractType: new FormControl(''),
      joiningLetter: new FormControl(''),
      coach: new FormControl(''),
      numberOfChildren: new FormControl(''),
      manager: new FormControl(''),
      maritalStatus: new FormControl(''),
      //pdf: new FormControl('', Validators.required),
      // link: new FormControl('', Validators.required),
    });
  }
}
