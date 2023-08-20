import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { Messages } from 'src/app/main/messages/messages';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import CityValidation from 'src/app/main/validations/CityValidation';

@Component({
  selector: 'app-add-city',
  templateUrl: './add-city.component.html',
  styleUrls: ['./add-city.component.css'],
})
export class AddCityComponent extends URLLoader implements OnInit {
  cityForm: FormGroup;
  // msg: DepartementMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  departementI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: CityValidation,
    //private message: DepartementMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.cityForm = this.validation.formGroupInstance;
    // this.msg = this.message;
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/city']);
      });
  }
  get f() {
    return this.cityForm.controls;
  }

  ngOnInit(): void {
    //this.getDepartementByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.cityForm.reset();
  }

  add() {
    this.submitted = true;
    //   if (this.validation.checkValidation()) {
    console.log(this.cityForm.value);
    this.httpService
      .create(CONFIG.URL_BASE + '/city/create', this.cityForm.value)
      .then(() => {
        this.cityForm.reset();
        this.closeModalEvent.emit();
        // this.closeModal();
        //
        super.show(
          'Confirmation',
          Messages.ADD_CONFIRMATION_MSG,
          //this.msg.addConfirmation[CONFIG.getInstance().getLang()],
          'success'
        );
        this.goBack();
      });

    // }
  }
}
