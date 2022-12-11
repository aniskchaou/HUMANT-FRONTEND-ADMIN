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

  /*String FullName;
	String Phone;
	String BirthDay;
	String Gender;
	String PresentAddress;
	String PermanentAddress;
	String Photo;
	String Note;
	@ManyToOne
	@JoinColumn(name="departement_id")
	Departement departement;
	@ManyToOne
	@JoinColumn(name="job_id")
	Job job;
	String JoiningDate;
	@ManyToOne
	@JoinColumn(name="salary_id")
	Salary salary;
	String EmergencyContactName;
	String ContactNumber;
	String EmergencyContactNumber;
	String ContactNote;
	String Resume;
	String OfferLetter;
	String JoiningLetter;
	String ContractAgreement;
	String IdentityProof;
	@ManyToOne
	@JoinColumn(name="contract_type_id")
	ContractType contractType;
	String maritalStatus;
	String numberOfChildren;
	String coach;
	String manager;*/
  createFormGroup() {
    return new FormGroup({
      edition_year: new FormControl(''),
      publishing_year: new FormControl(''),
      publishing_place: new FormControl(''),
      number_of_pages: new FormControl(''),
      //pdf: new FormControl('', Validators.required),
      // link: new FormControl('', Validators.required),
    });
  }
}
