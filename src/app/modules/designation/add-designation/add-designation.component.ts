import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-add-designation',
  templateUrl: './add-designation.component.html',
  styleUrls: ['./add-designation.component.css'],
})
export class AddDesignationComponent implements OnInit {
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }
  /*categoryForm: FormGroup;
 // msg: DesignationMessage;
  submitted = false;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  selectedFile: File;
  retrievedImage: any;
  base64Data: any;

  constructor(
    private validation: DesignationValidation,
    private message: DesignationMessage,
    private httpService: HTTPService,
    private router: Router
  ) {
    super();
    this.categoryForm = this.validation.formGroupInstance;
    this.msg = this.message;
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
    return this.categoryForm.controls;
  }

  ngOnInit(): void {
    //this.getDesignationByLang(CONFIG.getInstance().getLang());
  }

  reset() {
    this.categoryForm.reset();
  }

  add() {
    this.submitted = true;
    if (this.validation.checkValidation()) {
      this.httpService.create(
        CONFIG.URL_BASE + '/category/create',
        this.categoryForm.value
      );
      this.categoryForm.reset();
      this.closeModal();
      this.goBack();
      super.show(
        'Confirmation',
        this.msg.addConfirmation[CONFIG.getInstance().getLang()],
        'success'
      );
    }
  }*/
}
