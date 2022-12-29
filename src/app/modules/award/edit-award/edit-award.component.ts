import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Award from 'src/app/main/models/Award';
import AwardType from 'src/app/main/models/AwardType';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-award',
  templateUrl: './edit-award.component.html',
  styleUrls: ['./edit-award.component.css'],
})
export class EditAwardComponent extends URLLoader implements OnInit {
  model: Award = new Award(0, undefined, undefined, '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  employees$: any[];
  awardTypes$: any[];

  constructor(
    //  private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Award(0, undefined, undefined, '', '');
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
    // this.getCategoryByLang(CONFIG.getInstance().getLang());
    this.getEmployees();
    this.getAwardType();
  }

  ngOnChanges(changes: any) {
    this.getCategory();

    //  this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/award/' + this.id)
        .subscribe((data: Award) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.model.awardType = this.awardTypes$.filter(
      (x) => x.id == this.model.awardType.id
    )[0];
    this.model.employeeName = this.employees$.filter(
      (x) => x.id == this.model.employeeName.id
    )[0];
    this.httpService
      .create(CONFIG.URL_BASE + '/award/create', this.model)
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

  getAwardType() {
    // this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/typeaward/all')
      //  .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.awardTypes$ = data;
          // this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  getEmployees() {
    //this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/employee/all')
      //.pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.employees$ = data;
          // this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }
}
