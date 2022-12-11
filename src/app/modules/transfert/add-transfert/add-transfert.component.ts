import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import TransferValidation from 'src/app/main/validations/TransferValidation';

@Component({
  selector: 'app-add-transfert',
  templateUrl: './add-transfert.component.html',
  styleUrls: ['./add-transfert.component.css'],
})
export class AddTransfertComponent extends URLLoader implements OnInit {
  transferForm: FormGroup;
  // msg: TransferMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  transferI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: TransferValidation,
    //  private message: TransferMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.transferForm = this.validation.formGroupInstance;
    //this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/transfer']);
      });
  }
  get f() {
    return this.transferForm.controls;
  }

  ngOnInit(): void {
    // this.getTransferByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.transferForm.reset();
  }

  add() {
    this.submitted = true;
    if (this.validation.checkValidation()) {
      this.httpService.create(
        CONFIG.URL_BASE + '/transfer/create',
        this.transferForm.value
      );
      this.transferForm.reset();
      this.closeModal();
      this.goBack();
      super.show(
        'Confirmation',
        // this.msg.addConfirmation[CONFIG.getInstance().getLang()]
        '',
        'success'
      );
    }
  }
}
