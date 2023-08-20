import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
import { HttpErrorResponse } from '@angular/common/http';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-education-level',
  templateUrl: './education-level.component.html',
  styleUrls: ['./education-level.component.css'],
})
export class EducationLevelComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  educationLevel$: any;
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
      .getAll(CONFIG.URL_BASE + '/educationLevel/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          console.log(data);
          this.educationLevel$ = data;
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
        this.router.navigate(['/education-level']);
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
        .remove(CONFIG.URL_BASE + '/educationLevel/delete/' + id)
        .then(() => {
          /*   super.show(
            'Confirmation',
            'this.messageService.confirmationMessages.delete',
            'success'
          ); */
        })
        .finally(() => {
          this.getAll();
        });
    }
  }
}
