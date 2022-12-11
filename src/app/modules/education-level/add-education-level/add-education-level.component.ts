import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import EducationLevelValidation from 'src/app/main/validations/EducationLevelValidation';

@Component({
  selector: 'app-add-education-level',
  templateUrl: './add-education-level.component.html',
  styleUrls: ['./add-education-level.component.css'],
})
export class AddEducationLevelComponent extends URLLoader implements OnInit {
  educationLevelForm: FormGroup;
  //msg: NoticeMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: EducationLevelValidation,
    // private message: NoticeMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.educationLevelForm = this.validation.formGroupInstance;
    //this.msg = this.message;
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
    return this.educationLevelForm.controls;
  }

  ngOnInit(): void {
    // this.getNoticeByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.educationLevelForm.reset();
  }

  add() {
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(
        CONFIG.URL_BASE + '/educationLevel/create',
        this.educationLevelForm.value
      )
      .then(() => {
        this.educationLevelForm.reset();
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
