import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import AdvanceValidation from 'src/app/main/validations/AdvanceValidation';

@Component({
  selector: 'app-add-advance-salary',
  templateUrl: './add-advance-salary.component.html',
  styleUrls: ['./add-advance-salary.component.css'],
})
export class AddAdvanceSalaryComponent extends URLLoader implements OnInit {
  advanceSalaryForm: FormGroup;
  //msg: AdvanceMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  advanceI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  employees$: any[];

  constructor(
    private validation: AdvanceValidation,
    //private message: AdvanceMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.advanceSalaryForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/advance']);
      });
  }
  get f() {
    return this.advanceSalaryForm.controls;
  }

  ngOnInit(): void {
    //this.getAdvanceByLang(CONFIG.getInstance().getLang());
    this.getEmployees();
  }

  reset() {
    this.advanceSalaryForm.reset();
  }

  getEmployees() {
    //this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //  .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          //  this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  add() {
    this.advanceSalaryForm.value.employeeName = this.employees$.filter(
      (x) => x.id == parseInt(this.advanceSalaryForm.value.employeeName)
    )[0];
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(
        CONFIG.URL_BASE + '/advanceSalary/create',
        this.advanceSalaryForm.value
      )
      .then(() => {
        this.advanceSalaryForm.reset();
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          '',
          //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      });
    // }
  }
}
