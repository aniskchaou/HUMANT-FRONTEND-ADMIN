import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import CountryValidation from 'src/app/main/validations/CountryValidation';

@Component({
  selector: 'app-add-country',
  templateUrl: './add-country.component.html',
  styleUrls: ['./add-country.component.css'],
})
export class AddCountryComponent extends URLLoader implements OnInit {
  countryForm: FormGroup;
  // msg: DepartementMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  departementI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: CountryValidation,
    //private message: DepartementMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.countryForm = this.validation.formGroupInstance;
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
    return this.countryForm.controls;
  }

  ngOnInit(): void {
    //this.getDepartementByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.countryForm.reset();
  }

  add() {
    this.submitted = true;
    //   if (this.validation.checkValidation()) {
    console.log(this.countryForm.value);
    this.httpService
      .create(CONFIG.URL_BASE + '/country/create', this.countryForm.value)
      .then(() => {
        this.countryForm.reset();
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
