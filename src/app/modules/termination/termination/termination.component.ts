import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';
import CONFIG from 'src/app/main/urls/urls';
@Component({
  selector: 'app-termination',
  templateUrl: './termination.component.html',
  styleUrls: ['./termination.component.css'],
})
export class TerminationComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;
  loading: boolean;
  termination$: any[] = [];
  id = 0;

  edit(id) {
    this.id = id;
  }

  delete(id) {
    var r = confirm('Do you want to delete this recording ?');
    if (r) {
      this.httpService
        .remove(CONFIG.URL_BASE + '/termination/delete/' + id)
        .then(() => {
          super.show(
            'Confirmation',
            'this.messageService.confirmationMessages.delete',
            'success'
          );
          this.reloadPage();
        });
    }
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
      .getAll(CONFIG.URL_BASE + '/termination/all')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data: any[]) => {
          this.termination$ = data;
          this.loading = false;
          console.log(data);
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
}
