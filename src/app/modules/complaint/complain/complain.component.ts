import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
@Component({
  selector: 'app-complain',
  templateUrl: './complain.component.html',
  styleUrls: ['./complain.component.css'],
})
export class ComplainComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  complain$: Object;
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
      .getAll(CONFIG.URL_BASE + '/complain/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this.complain$ = data;
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
        this.router.navigate(['/expense']);
      });
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeEdit'
    )[0] as HTMLElement;
    element.click();
  }

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    element.click();
    this.getAll();
  }

  delete(id) {
    var r = confirm('Do you want to delete this recording ?');
    if (r) {
      this.httpService
        .remove(CONFIG.URL_BASE + '/complain/delete/' + id)
        .then(() => {
          /*   super.show(
            'Confirmation',
            'this.messageService.confirmationMessages.delete',
            'success'
          ); */
          // this.reloadPage();
        })
        .finally(() => {
          this.getAll();
        });
    }
  }
}
