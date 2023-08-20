import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { Messages } from 'src/app/main/messages/messages';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css'],
})
export class CityComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  citys$: any;
  id = 0;

  constructor(private httpService: HTTPService, private router: Router) {
    super();
    super.loadScripts();
  }

  ngOnInit() {
    this.getAll();
  }

  edit(id) {
    this.id = id;
  }

  getAll() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/city/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.citys$ = data;
          this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  reloadPage() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/city']);
      });
  }

  delete(id) {
    var r = confirm(Messages.DELETE_ASK_MSG);
    if (r) {
      console.log(CONFIG.URL_BASE + '/city/delete/' + id);
      this.httpService
        .remove(CONFIG.URL_BASE + '/city/delete/' + id)
        .then(() => {
          super.show(
            'Confirmation',
            Messages.DELETE_CONFIRMATION_MSG,
            'success'
          );
          console.log('deleted');
          this.reloadPage();
          this.getAll();
        })
        .finally(() => {
          this.getAll();
        });
    }
  }

  closeModalAdd() {
    let element: HTMLElement = document.getElementById(
      'closeAdd'
    ) as HTMLElement;
    element.click();
    this.getAll();
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementById(
      'closeEdit'
    ) as HTMLElement;
    element.click();
    this.getAll();
  }
}
