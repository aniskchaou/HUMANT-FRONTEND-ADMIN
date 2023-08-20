import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import DepartementValidation from 'src/app/main/validations/DepartementValidation';

@Component({
  selector: 'app-add-departement',
  templateUrl: './add-departement.component.html',
  styleUrls: ['./add-departement.component.css'],
})
export class AddDepartementComponent extends URLLoader implements OnInit {
  departementForm: FormGroup;
  // msg: DepartementMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  departementI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: DepartementValidation,
    //private message: DepartementMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.departementForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/departement']);
      });
  }
  get f() {
    return this.departementForm.controls;
  }

  ngOnInit(): void {
    //this.getDepartementByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.departementForm.reset();
  }

  add() {
    this.submitted = true;
    //   if (this.validation.checkValidation()) {
    console.log(this.departementForm.value);
    this.httpService
      .create(
        CONFIG.URL_BASE + '/departement/create',
        this.departementForm.value
      )
      .then(() => {
        this.departementForm.reset();
        this.closeModal();
        //this.goBack();
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
