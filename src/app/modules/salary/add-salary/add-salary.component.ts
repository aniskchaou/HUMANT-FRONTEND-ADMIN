import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import SalaryValidation from 'src/app/main/validations/SalaryValidation';

@Component({
  selector: 'app-add-salary',
  templateUrl: './add-salary.component.html',
  styleUrls: ['./add-salary.component.css'],
})
export class AddSalaryComponent extends URLLoader implements OnInit {
  ngOnInit(): void {}
  salaryForm: FormGroup;
  msg: CategoryMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: SalaryValidation,
    private message: CategoryMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.salaryForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/category']);
      });
  }
  get f() {
    return this.salaryForm.controls;
  }

  reset() {
    this.salaryForm.reset();
  }

  add() {
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/salary/create', this.salaryForm.value)
      .then(() => {
        this.salaryForm.reset();
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
      });
    //  }
  }
}
