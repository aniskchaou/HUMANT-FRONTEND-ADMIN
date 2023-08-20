import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import { HttpErrorResponse } from '@angular/common/http';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.css'],
})
export class ContractComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  contract$: any;
  id = 0;

  constructor(private httpService: HTTPService, private router: Router) {
    super();
  }
  edit(id) {
    this.id = id;
  }

  ngOnInit() {
    this.getAll();
    super.loadScripts();
  }

  getAll() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/contract/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          console.log(data);
          this.contract$ = data;
          this.loading = false;
        },
        (err: HttpErrorResponse) => {
          super.show('Error', err.message, 'warning');
        }
      );
  }

  delete(id) {
    var r = confirm('Do you want to delete this recording ?');
    if (r) {
      console.log(CONFIG.URL_BASE + '/contract/delete/' + id);
      this.httpService
        .remove(CONFIG.URL_BASE + '/contract/delete/' + id)
        .then(() => {
          /*super.show(
            'Confirmation',
            'this.messageService.confirmationMessages.delete',
            'success'
          );*/
          console.log('deleted');
          //this.reloadPage();
          this.getAll();
        })
        .finally(() => {
          this.getAll();
        });
    }
  }

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    element.click();
  }

  reloadPage() {
    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => {
        this.router.navigate(['/expense']);
      });
  }
}
