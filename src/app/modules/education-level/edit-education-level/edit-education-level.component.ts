import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import EducationLevel from 'src/app/main/models/EducationLevel';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-education-level',
  templateUrl: './edit-education-level.component.html',
  styleUrls: ['./edit-education-level.component.css'],
})
export class EditEducationLevelComponent extends URLLoader implements OnInit {
  model: EducationLevel = new EducationLevel(0, '', '', '', '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;

  constructor(
    //private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new EducationLevel(0, '', '', '', '', '');
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/education-level']);
      });
  }

  ngOnInit(): void {
    this.getCategory();
    this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  ngOnChanges(changes: any) {
    this.getCategory();
    this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/educationLevel/' + this.id)
        .subscribe((data: EducationLevel) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.httpService
      .create(CONFIG.URL_BASE + '/educationLevel/create', this.model)
      .finally(() => {
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          this.message.confirmationMessages.edit,
          'success'
        );
        //  this.closeModal();
      });
  }

  getCategoryByLang(lang) {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/i18n/category/' + lang)
      .subscribe(
        (data) => {
          this.categoryI18n = data;
          console.log(data);
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
