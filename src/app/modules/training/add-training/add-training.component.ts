import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import TrainingValidation from 'src/app/main/validations/TrainingValidation';

@Component({
  selector: 'app-add-training',
  templateUrl: './add-training.component.html',
  styleUrls: ['./add-training.component.css'],
})
export class AddTrainingComponent extends URLLoader implements OnInit {
  trainingForm: FormGroup;
  msg: CategoryMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  trainingI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  typeTerminations$: any[];
  employees$: any[];

  constructor(
    private validation: TrainingValidation,
    private message: CategoryMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.trainingForm = this.validation.formGroupInstance;
    this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/training']);
      });
  }
  get f() {
    return this.trainingForm.controls;
  }

  ngOnInit(): void {
    //this.getCategoryByLang(CONFIG.getInstance().getLang());
    this.getTypeTermination();
    this.getEmployees();
  }

  reset() {
    this.trainingForm.reset();
  }

  add() {
    this.trainingForm.value.typetraining = this.typeTerminations$.filter(
      (x) => x.id == parseInt(this.trainingForm.value.typetraining)
    )[0];
    this.trainingForm.value.employee = this.employees$.filter(
      (x) => x.id == parseInt(this.trainingForm.value.employee)
    )[0];
    console.log(this.trainingForm.value);
    this.submitted = true;
    //   if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/training/create', this.trainingForm.value)
      .then(() => {
        this.trainingForm.reset();
        this.closeModal();
        this.goBack();
        /*   super.show(
          'Confirmation',
          'this.msg.addConfirmation[CONFIG.getInstance().getLang()]',
          'success'
        ); */
      });
    // }
  }

  getTypeTermination() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/typetraining/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.typeTerminations$ = data;
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getEmployees() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          //this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
