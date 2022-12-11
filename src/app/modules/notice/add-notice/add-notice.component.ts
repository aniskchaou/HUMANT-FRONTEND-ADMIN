import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import NoticeValidation from 'src/app/main/validations/NoticeValidation';

@Component({
  selector: 'add-notice',
  templateUrl: './add-notice.component.html',
  styleUrls: ['./add-notice.component.css'],
})
export class AddNoticeComponent extends URLLoader implements OnInit {
  noticeForm: FormGroup;
  //msg: NoticeMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: NoticeValidation,
    // private message: NoticeMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.noticeForm = this.validation.formGroupInstance;
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
    return this.noticeForm.controls;
  }

  ngOnInit(): void {
    // this.getNoticeByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.noticeForm.reset();
  }

  add() {
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/notice/create', this.noticeForm.value)
      .then(() => {
        this.noticeForm.reset();
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
