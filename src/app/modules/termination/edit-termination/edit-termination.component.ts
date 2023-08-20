import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Termination from 'src/app/main/models/Termination';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-termination',
  templateUrl: './edit-termination.component.html',
  styleUrls: ['./edit-termination.component.css'],
})
export class EditTerminationComponent extends URLLoader implements OnInit {
  model: Termination = new Termination(0, '', undefined, '', '', '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  employees$: any[];

  constructor(
    //private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Termination(0, '', undefined, '', '', '', '');
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  goBack() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/termination']);
      });
  }

  ngOnInit(): void {
    this.getCategory();
    this.getAll();
  }

  ngOnChanges(changes: any) {
    this.getCategory();
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/termination/' + this.id)
        .subscribe((data: Termination) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.model.name = this.employees$.filter(
      (x) => x.id == parseInt(this.model.name)
    )[0];
    this.httpService
      .create(CONFIG.URL_BASE + '/termination/create', this.model)
      .then(() => {
        this.closeModal();

        super.show(
          'Confirmation',
          this.message.confirmationMessages.edit,
          'success'
        );
        this.closeModal();
      })
      .finally(() => {
        this.goBack();
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
