import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import EmployeeValidation from 'src/app/main/validations/EmployeeValidation';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
})
export class AddEmployeeComponent extends URLLoader implements OnInit {
  employeeForm: FormGroup;
  // msg: EmployeeMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  employeeI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  contractTypes$: any[];
  salaries$: any[];
  departements$: any[];
  jobs$: any[];

  constructor(
    private validation: EmployeeValidation,
    // private message: EmployeeMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.employeeForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/employee']);
      });
  }
  get f() {
    return this.employeeForm.controls;
  }

  ngOnInit(): void {
    //this.getEmployeeByLang(CONFIG.getInstance().getLang());
    this.getContactTypes();
    this.getDepartements();
    this.getJobs();
    this.getSalaries();
  }

  reset() {
    this.employeeForm.reset();
  }

  add() {
    this.employeeForm.value.departement = this.departements$.filter(
      (x) => x.id == parseInt(this.employeeForm.value.departement)
    )[0];
    this.employeeForm.value.contractType = this.contractTypes$.filter(
      (x) => x.id == parseInt(this.employeeForm.value.contractType)
    )[0];
    this.employeeForm.value.salary = this.salaries$.filter(
      (x) => x.id == parseInt(this.employeeForm.value.salary)
    )[0];
    this.employeeForm.value.job = this.jobs$.filter(
      (x) => x.id == parseInt(this.employeeForm.value.job)
    )[0];
    this.submitted = true;
    console.log(this.employeeForm.value);
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/employee/create', this.employeeForm.value)
      .finally(() => {
        this.employeeForm.reset();
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          '',
          // this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      });

    //}
  }

  getDepartements() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/departement/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.departements$ = data;
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getJobs() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/job/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.jobs$ = data;
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getSalaries() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/salary/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.salaries$ = data;
          //this.loading = false;
          console.log(data);
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getContactTypes() {
    // this.loading = true;

    this.httpService
      .getAll(CONFIG.URL_BASE + '/contracttype/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.contractTypes$ = data;
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
