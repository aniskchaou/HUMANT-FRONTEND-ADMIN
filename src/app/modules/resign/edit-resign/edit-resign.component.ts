import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Employee from 'src/app/main/models/Employee';
import Resignation from 'src/app/main/models/Resignation';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-resign',
  templateUrl: './edit-resign.component.html',
  styleUrls: ['./edit-resign.component.css'],
})
export class EditResignComponent extends URLLoader implements OnInit {
  model: Resignation = new Resignation(0, '', '', '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  employees$: any[];
  departements$: any[];

  constructor(
    //private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Resignation(0, '', '', '', '');
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

  ngOnInit(): void {
    this.getCategory();
    //this.getCategoryByLang(CONFIG.getInstance().getLang());
    this.getAll();
    this.getAllDepartements();
  }

  ngOnChanges(changes: any) {
    this.getCategory();
    //this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/resignation/' + this.id)
        .subscribe((data: Resignation) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.model.employeeName = this.employees$.filter(
      (x) => x.id == parseInt(this.model.employeeName)
    )[0];

    this.model.departement = this.departements$.filter(
      (x) => x.id == parseInt(this.model.departement)
    )[0];
    this.httpService
      .create(CONFIG.URL_BASE + '/resignation/create', this.model)
      .then(() => {
        this.closeModal();
      })
      .finally(() => {
        this.closeModal();
        this.router
          .navigateByUrl('/dashboard', { skipLocationChange: true })
          .then(() => {
            this.router.navigate(['/resign']);
          });
      });

    /*  this.goBack();
    super.show(
      'Confirmation',
      this.message.confirmationMessages.edit,
      'success'
    );
    this.closeModal(); */
  }

  getCategoryByLang(lang) {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/i18n/category/' + lang)
      .subscribe(
        (data: Employee[]) => {
          this.categoryI18n = data;
          console.log(data);
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getAll() {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')

      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          console.log(data);
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getAllDepartements() {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/departement/all')

      .subscribe(
        (data: any[]) => {
          this.departements$ = data;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
