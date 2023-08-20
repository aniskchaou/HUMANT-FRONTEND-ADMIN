import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import TypeTrainingValidation from 'src/app/main/validations/TypetrainingValidation';

@Component({
  selector: 'add-training-type',
  templateUrl: './add-training-type.component.html',
  styleUrls: ['./add-training-type.component.css'],
})
export class AddTrainingTypeComponent extends URLLoader implements OnInit {
  typetrainingForm: FormGroup;
  //msg: CategoryMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: TypeTrainingValidation,
    // private message: CategoryMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.typetrainingForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/training-type']);
      });
  }
  get f() {
    return this.typetrainingForm.controls;
  }

  ngOnInit(): void {
    // this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.typetrainingForm.reset();
  }

  add() {
    this.submitted = true;
    if (this.validation.checkValidation()) {
      this.httpService
        .create(
          CONFIG.URL_BASE + '/typetraining/create',
          this.typetrainingForm.value
        )
        .then(() => {
          console.log(this.typetrainingForm.value);
          this.typetrainingForm.reset();
          this.closeModal();
          /* this.goBack();
          super.show(
            'Confirmation',
            ' this.msg.addConfirmation[CONFIG.getInstance().getLang()]',
            'success'
          ); */
        });
    }
  }

  getCategoryByLang(lang) {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/i18n/category/' + lang)
      .subscribe(
        (data) => {
          this.categoryI18n = data;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
