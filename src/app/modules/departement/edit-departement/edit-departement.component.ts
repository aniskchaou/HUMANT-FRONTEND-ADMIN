import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import Departemnt from 'src/app/main/models/Departement';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-departement',
  templateUrl: './edit-departement.component.html',
  styleUrls: ['./edit-departement.component.css'],
})
export class EditDepartementComponent extends URLLoader implements OnInit {
  model: Departemnt = new Departemnt(0, '', '');
  @Input() id = undefined;
  @Output() closeModalEventEdit = new EventEmitter<string>();
  categoryI18n;

  constructor(
    // private categoryTestService: CategoryTestService,
    private httpService: HTTPService,
    private message: CategoryMessage,
    private router: Router
  ) {
    super();
    this.model = new Departemnt(0, '', '');
  }

  closeModal() {
    this.closeModalEventEdit.emit();
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
  }

  ngOnChanges(changes: any) {
    this.getCategory();
    // this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  getCategory() {
    if (this.id != undefined) {
      this.httpService
        .get(CONFIG.URL_BASE + '/departement/' + this.id)
        .subscribe((data: Departemnt) => {
          this.model = data;
          console.log(this.model);
        });
    }
  }

  edit() {
    this.httpService.create(
      CONFIG.URL_BASE + '/departement/create',
      this.model
    );
    this.closeModal();
    //this.goBack();
    super.show(
      'Confirmation',
      this.message.confirmationMessages.edit,
      'success'
    );
    //this.closeModal();
  }
}
