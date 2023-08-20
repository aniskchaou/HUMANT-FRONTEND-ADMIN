import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import CategoryMessage from 'src/app/main/messages/CategoryMessage';
import { Messages } from 'src/app/main/messages/messages';
import City from 'src/app/main/models/City';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-edit-city',
  templateUrl: './edit-city.component.html',
  styleUrls: ['./edit-city.component.css'],
})
export class EditCityComponent extends URLLoader implements OnInit {
  model: City = new City(0, '');
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
    this.model = new City(0, '');
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
    // this.getCategoryByLang(CONFIG.getInstance().getLang());
  }

  ngOnChanges(changes: any) {
    // this.getCategoryByLang(CONFIG.getInstance().getLang());
    this.httpService
      .get(CONFIG.URL_BASE + '/city/' + this.id)
      .subscribe((data: City) => {
        this.model = data;
        console.log(this.model);
      });
  }

  edit() {
    this.httpService
      .create(CONFIG.URL_BASE + '/city/create', this.model)
      .then(() => {
        this.closeModalEventEdit.emit();
      });
    // this.closeModal();
    //this.goBack();
    super.show('Confirmation', Messages.EDIT_CONFIRMATION_MSG, 'success');
  }
}
