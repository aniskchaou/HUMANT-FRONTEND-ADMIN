import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import AwardTypeValidation from 'src/app/main/validations/AwardTypeValidation';
import { AwardTypeComponent } from '../award-type/award-type.component';

@Component({
  selector: 'app-add-award-type',
  templateUrl: './add-award-type.component.html',
  styleUrls: ['./add-award-type.component.css'],
})
export class AddAwardTypeComponent extends URLLoader implements OnInit {
  awardTypeForm: FormGroup;
  //msg: AdvanceMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  advanceI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: AwardTypeValidation,
    //private message: AdvanceMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.awardTypeForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/award-type']);
      });
  }
  get f() {
    return this.awardTypeForm.controls;
  }

  ngOnInit(): void {
    //this.getAdvanceByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.awardTypeForm.reset();
  }

  add() {
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(CONFIG.URL_BASE + '/typeaward/create', this.awardTypeForm.value)
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        console.log(this.awardTypeForm.value);
        this.awardTypeForm.reset();
        this.closeModal();
      });

    //this.goBack();
    /*super.show(
        'Confirmation',
        '',
        //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
        'success'
      );*/
    //}
  }
}
