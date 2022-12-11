import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import AwardValidation from 'src/app/main/validations/AwardValidation';

@Component({
  selector: 'app-add-award',
  templateUrl: './add-award.component.html',
  styleUrls: ['./add-award.component.css'],
})
export class AddAwardComponent extends URLLoader implements OnInit {
  awardForm: FormGroup;
  //msg: AwardMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  awardI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  awardTypes$: any[] = [];
  employees$: any[] = [];

  constructor(
    private validation: AwardValidation,
    //private message: AwardMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.awardForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/award']);
      });
  }
  get f() {
    return this.awardForm.controls;
  }

  ngOnInit(): void {
    //  this.getAwardByLang(CONFIG.getInstance().getLang());
    this.getAwardType();
    this.getEmployees();
  }

  reset() {
    this.awardForm.reset();
  }

  add() {
    this.awardForm.value.awardType = this.awardTypes$.filter(
      (x) => x.id == parseInt(this.awardForm.value.awardType)
    )[0];
    this.awardForm.value.employeeName = this.employees$.filter(
      (x) => x.id == parseInt(this.awardForm.value.employeeName)
    )[0];
    console.log(this.awardForm.value);
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/award/create', this.awardForm.value)
      .then(() => {
        this.awardForm.reset();
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          '',
          // this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      });

    // }
  }

  getAwardType() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/typeaward/all')
      //  .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.awardTypes$ = data;
          // this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getEmployees() {
    //this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          // this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
