import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import ResignationValidation from 'src/app/main/validations/ResignationValidation';

@Component({
  selector: 'app-add-resignation',
  templateUrl: './add-resignation.component.html',
  styleUrls: ['./add-resignation.component.css'],
})
export class AddResignationComponent extends URLLoader implements OnInit {
  resignationForm: FormGroup;
  // msg: ResignationMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  resignationI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  loading: boolean;
  departements$: any[];
  employees$: any[];

  constructor(
    private validation: ResignationValidation,
    //private message: ResignationMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.resignationForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/resignation']);
      });
  }
  get f() {
    return this.resignationForm.controls;
  }

  ngOnInit(): void {
    // this.getResignationByLang(CONFIG.getInstance().getLang());
    this.getEmployeees();
    this.getDepartement();
  }

  reset() {
    this.resignationForm.reset();
  }

  add() {
    this.resignationForm.value.employeeName = this.employees$.filter(
      (x) => x.id == parseInt(this.resignationForm.value.employeeName)
    )[0];

    this.resignationForm.value.departement = this.departements$.filter(
      (x) => x.id == parseInt(this.resignationForm.value.departement)
    )[0];
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(
        CONFIG.URL_BASE + '/resignation/create',
        this.resignationForm.value
      )
      .then(() => {
        this.resignationForm.reset();
        this.closeModal();
        this.goBack();
        /* super.show(
          'Confirmation',
          '',
          // this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        ); */
      });

    //}
  }

  getEmployeees() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          this.loading = false;
          console.log(data);
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getDepartement() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/departement/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.departements$ = data;
          console.log(data);
          this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
