import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Complain from 'src/app/main/models/Complain';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-complain',
  templateUrl: './edit-complain.component.html',
  styleUrls: ['./edit-complain.component.css'],
})
export class EditComplainComponent extends URLLoader implements OnInit {
  model: Complain = new Complain(0, '', '', '', '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  employees$: any[];

  constructor(
    // private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Complain(0, '', '', '', '', '');
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/complain']);
      });
  }

  ngOnInit(): void {
    this.getCategory();
    console.log(this.id);
    this.getAll();
  }

  ngOnChanges(changes: any) {
    this.getCategory();
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/complain/' + this.id)
        .subscribe((data: Complain) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.model.complainAgainst = this.employees$.filter(
      (x) => x.id == parseInt(this.model.complainAgainst)
    )[0];
    this.model.complainBy = this.employees$.filter(
      (x) => x.id == parseInt(this.model.complainBy)
    )[0];
    this.httpService
      .create(CONFIG.URL_BASE + '/complain/create', this.model)
      .then(() => {})
      .finally(() => {
        // this.closeModal();
        this.goBack();
        super.show(
          'Confirmation',
          this.message.confirmationMessages.edit,
          'success'
        );
        this.closeModal();
      });
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
}
