import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Advance from 'src/app/main/models/Advance';
import Departemnt from 'src/app/main/models/Departement';
import Employee from 'src/app/main/models/Employee';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-advance-salary',
  templateUrl: './edit-advance-salary.component.html',
  styleUrls: ['./edit-advance-salary.component.css'],
})
export class EditAdvanceSalaryComponent extends URLLoader implements OnInit {
  model: Advance = new Advance(0, '', undefined, '', '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  employees$: Employee[];

  constructor(
    //private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Advance(0, '', undefined, '', '', '');
  }

  getAll() {
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')

      .subscribe(
        (data: Employee[]) => {
          this.employees$ = data;
          console.log(data);
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
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
    //  this.getCategoryByLang(CONFIG.getInstance().getLang());
    this.getEmployees();
  }

  ngOnChanges(changes: any) {
    this.getCategory();
    // this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/advanceSalary/' + this.id)
        .subscribe((data: Advance) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.model.employeeName = this.employees$.filter(
      (x) => x.id == this.model.employeeName.id
    )[0];
    this.httpService
      .create(CONFIG.URL_BASE + '/advanceSalary/create', this.model)
      .then(() => {
        this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          this.message.confirmationMessages.edit,
          'success'
        );
        this.closeModal();
      });
  }

  getEmployees() {
    //this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //  .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          //  this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
