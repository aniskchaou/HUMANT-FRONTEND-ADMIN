import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import TerminationMessage from 'src/app/main/messages/TerminationMessage';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import TerminationValidation from 'src/app/main/validations/TerminationValidation';

@Component({
  selector: 'app-add-termination',
  templateUrl: './add-termination.component.html',
  styleUrls: ['./add-termination.component.css'],
})
export class AddTerminationComponent extends URLLoader implements OnInit {
  terminationForm: FormGroup;
  // msg: TerminationMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  terminationI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  msg: TerminationMessage;
  employees$: any[] = [];

  constructor(
    private validation: TerminationValidation,
    private message: TerminationMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.terminationForm = this.validation.formGroupInstance;
    this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/termination']);
      });
  }
  get f() {
    return this.terminationForm.controls;
  }

  ngOnInit(): void {
    // this.getTerminationByLang(CONFIG.getInstance().getLang());
    this.getAll();
  }

  reset() {
    this.terminationForm.reset();
  }

  add() {
    this.submitted = true;
    //  if (this.validation.checkValidation()) {
    this.httpService
      .create(
        CONFIG.URL_BASE + '/termination/create',
        this.terminationForm.value
      )
      .then(() => {
        this.terminationForm.reset();
        //this.closeModal();
        //this.goBack();
        super.show(
          'Confirmation',
          '',
          // this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      });
    //  }
  }

  getAll() {
    // this.loading = true;
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
}
