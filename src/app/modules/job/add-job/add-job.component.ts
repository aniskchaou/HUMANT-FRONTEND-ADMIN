import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import JobValidation from 'src/app/main/validations/JobValidation';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.css'],
})
export class AddJobComponent extends URLLoader implements OnInit {
  jobForm: FormGroup;
  // msg: DepartementMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  departementI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: JobValidation,
    //private message: DepartementMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.jobForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/job']);
      });
  }
  get f() {
    return this.jobForm.controls;
  }

  ngOnInit(): void {
    //this.getDepartementByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.jobForm.reset();
  }

  add() {
    this.submitted = true;
    //   if (this.validation.checkValidation()) {
    console.log(this.jobForm.value);
    this.httpService
      .create(CONFIG.URL_BASE + '/job/create', this.jobForm.value)
      .then(() => {
        this.jobForm.reset();
        this.closeModal();
        //this.goBack();
        super.show(
          'Confirmation',
          '',
          //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      })
      .finally(() => {
        this.closeModal();
        this.goBack();
      });

    // }
  }
}
