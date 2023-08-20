import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';

@Component({
  selector: 'app-award-type',
  templateUrl: './award-type.component.html',
  styleUrls: ['./award-type.component.css'],
})
export class AwardTypeComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  awardType$: any[] = [];
  id = 0;

  constructor(private httpService: HTTPService, private router: Router) {
    super();
  }

  edit(id) {
    this.id = id;
  }

  ngOnInit() {
    super.loadScripts();
    this.getAll();
  }

  getAll() {
    this.loading = true;
    this.httpService
      .getAll(CONFIG.URL_BASE + '/typeaward/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.awardType$ = data;
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

  delete(id) {
    var r = confirm('Do you want to delete this recording ?');
    if (r) {
      console.log(CONFIG.URL_BASE + '/typeaward/delete/' + id);
      this.httpService
        .remove(CONFIG.URL_BASE + '/typeaward/delete/' + id)
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
