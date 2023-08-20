import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css'],
})
export class CountryComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  countrys$: any;
  id = 0;

  constructor(private httpService: HTTPService, private router: Router) {
    super();
  }

  ngOnInit() {
    this.getAll();
    super.loadScripts();
  }

  edit(id) {
    this.id = id;
  }

  getAll() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/country/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.countrys$ = data;
          this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  reloadPage() {
    this.router
      .navigateByUrl('/country', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/country']);
      });
  }

  delete(id) {
    var r = confirm('Do you want to delete this recording ?');
    if (r) {
      console.log(CONFIG.URL_BASE + '/country/delete/' + id);
      this.httpService
        .remove(CONFIG.URL_BASE + '/country/delete/' + id)
        .then(() => {
          /*super.show(
            'Confirmation',
            'this.messageService.confirmationMessages.delete',
            'success'
          );*/
          console.log('deleted');
          //this.reloadPage();
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
