import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import AnnouncementValidation from 'src/app/main/validations/AnouncementValidation';

@Component({
  selector: 'app-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.css'],
})
export class AddAnnouncementComponent extends URLLoader implements OnInit {
  announcementForm: FormGroup;
  //msg: AwardMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  awardI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  departements$: any[] = [];
  employees$: any[] = [];

  constructor(
    private validation: AnnouncementValidation,
    //private message: AwardMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.announcementForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/announcement']);
      });
  }
  get f() {
    return this.announcementForm.controls;
  }

  ngOnInit(): void {
    //  this.getAwardByLang(CONFIG.getInstance().getLang());
    this.getDepartements();
    //this.getEmployees();
  }

  reset() {
    this.announcementForm.reset();
  }

  add() {
    this.announcementForm.value.department = this.departements$.filter(
      (x) => x.id == parseInt(this.announcementForm.value.department)
    )[0];

    console.log(this.announcementForm.value);
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(
        CONFIG.URL_BASE + '/announcement/create',
        this.announcementForm.value
      )
      .then(() => {
        this.announcementForm.reset();
        this.closeModal();
        //this.goBack();
        /*  super.show(
          'Confirmation',
          '',
          // this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        ); */
      });

    // }
  }

  getDepartements() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/departement/all')
      //  .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.departements$ = data;
          console.log(data);
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
