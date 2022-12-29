import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Announcement from 'src/app/main/models/Announcement';
import Departemnt from 'src/app/main/models/Departement';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-announcement',
  templateUrl: './edit-announcement.component.html',
  styleUrls: ['./edit-announcement.component.css'],
})
export class EditAnnouncementComponent extends URLLoader implements OnInit {
  model: Announcement = new Announcement(0, '', undefined, '', '', '', '', '');
  @Input() id = undefined;
  @Output() closeModalEvent = new EventEmitter<string>();
  categoryI18n;
  departements$: Departemnt[];

  constructor(
    //private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Announcement(0, '', undefined, '', '', '', '', '');
    this.getAll();
  }

  getAll() {
    //  this.loading = true;
    this.httpService.getAll(CONFIG.URL_BASE + '/departement/all').subscribe(
      (data: Departemnt[]) => {
        this.departements$ = data;
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
        this.router.navigate(['/announcement']);
      });
  }

  ngOnInit(): void {
    this.getCategory();
    //this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  ngOnChanges(changes: any) {
    this.getCategory();
    //this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  getCategory() {
    this.httpService
      .get(CONFIG.URL_BASE + '/announcement/' + this.id)
      .subscribe((data: Announcement) => {
        this.model = data;
        console.log(this.model);
      });
  }

  edit() {
    this.model.department = this.departements$.filter(
      (x) => x.id == this.model.department.id
    )[0];
    this.httpService.create(
      CONFIG.URL_BASE + '/announcement/create',
      this.model
    );
    this.closeModal();
    this.goBack();
    super.show(
      'Confirmation',
      this.message.confirmationMessages.edit,
      'success'
    );
    this.closeModal();
  }
}
