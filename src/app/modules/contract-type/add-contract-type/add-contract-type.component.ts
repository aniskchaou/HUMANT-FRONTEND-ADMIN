import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import ContractTypeValidation from 'src/app/main/validations/ContractTypeValidation';

@Component({
  selector: 'app-add-contract-type',
  templateUrl: './add-contract-type.component.html',
  styleUrls: ['./add-contract-type.component.css'],
})
export class AddContractTypeComponent extends URLLoader implements OnInit {
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  advanceI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;
  contractTypeForm: FormGroup;

  constructor(
    private validation: ContractTypeValidation,
    //private message: AdvanceMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.contractTypeForm = this.validation.formGroupInstance;
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
    return this.contractTypeForm.controls;
  }

  ngOnInit(): void {
    //this.getAdvanceByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.contractTypeForm.reset();
  }

  add() {
    this.submitted = true;
    // if (this.validation.checkValidation()) {
    this.httpService
      .create(
        CONFIG.URL_BASE + '/contracttype/create',
        this.contractTypeForm.value
      )
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        console.log(this.contractTypeForm.value);
        this.contractTypeForm.reset();
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
