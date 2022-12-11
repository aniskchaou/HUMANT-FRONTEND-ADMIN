import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import LeaveValidation from 'src/app/main/validations/LeaveValidation';

@Component({
  selector: 'app-add-leave',
  templateUrl: './add-leave.component.html',
  styleUrls: ['./add-leave.component.css'],
})
export class AddLeaveComponent extends URLLoader implements OnInit {
  leaveForm: FormGroup;
  // msg: LeaveMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  leaveI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: LeaveValidation,
    // private message: LeaveMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.leaveForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/leave']);
      });
  }
  get f() {
    return this.leaveForm.controls;
  }

  ngOnInit(): void {
    //this.getLeaveByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.leaveForm.reset();
  }

  add() {
    this.submitted = true;
    if (this.validation.checkValidation()) {
      this.httpService.create(
        CONFIG.URL_BASE + '/leave/create',
        this.leaveForm.value
      );
      this.leaveForm.reset();
      this.closeModal();
      this.goBack();
      super.show(
        'Confirmation',
        '',
        //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
        'success'
      );
    }
  }
}
