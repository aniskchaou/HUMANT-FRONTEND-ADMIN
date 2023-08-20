import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-training-type',
  templateUrl: './training-type.component.html',
  styleUrls: ['./training-type.component.css'],
})
export class TrainingTypeComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  typeTerminations$: any[];
  id = 0;

  edit(id) {
    this.id = id;
  }

  constructor(private httpService: HTTPService, private router: Router) {
    super();
  }

  ngOnInit() {
    this.getAll();
    super.loadScripts();
  }

  getAll() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/typetraining/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.typeTerminations$ = data;
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

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    element.click();
    this.getAll();
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeEdit'
    )[0] as HTMLElement;
    element.click();
    this.getAll();
  }

  delete(id) {
    var r = confirm('Do you want to delete this recording ?');
    if (r) {
      console.log(CONFIG.URL_BASE + '/departement/delete/' + id);
      this.httpService
        .remove(CONFIG.URL_BASE + '/typetraining/delete/' + id)
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
}
