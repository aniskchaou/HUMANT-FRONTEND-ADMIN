import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import ComplainValidation from 'src/app/main/validations/ComplainValidation';

@Component({
  selector: 'app-add-complaint',
  templateUrl: './add-complaint.component.html',
  styleUrls: ['./add-complaint.component.css'],
})
export class AddComplaintComponent extends URLLoader implements OnInit {
  complainForm: FormGroup;
  //msg: ComplainMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  complainI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  loading: boolean;
  employees$: any[];

  constructor(
    private validation: ComplainValidation,
    // private message: ComplainMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.complainForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/complain']);
      });
  }
  get f() {
    return this.complainForm.controls;
  }

  ngOnInit(): void {
    //this.getComplainByLang(CONFIG.getInstance().getLang());
    this.getEmployees();
  }

  reset() {
    this.complainForm.reset();
  }

  add() {
    this.loading = true;
    this.complainForm.value.ComplainBy = this.employees$.filter(
      (x) => x.id == parseInt(this.complainForm.value.ComplainBy)
    )[0];
    this.complainForm.value.ComplainAgainst = this.employees$.filter(
      (x) => x.id == parseInt(this.complainForm.value.ComplainAgainst)
    )[0];
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/complain/create', this.complainForm.value)
      .then(() => {
        this.complainForm.reset();
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          '',
          //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      });

    //}
  }

  getEmployees() {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //  .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
