import { Component } from '@angular/core';
import { Router } from '@angular/router';
import '@fortawesome/fontawesome-free/js/all.js';
import { URLLoader } from 'src/app/main/configs/URLLoader';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent extends URLLoader {
  title = 'my-app-angular';

  public router: string;

  constructor(private _router: Router) {
    super();
  }

  ngOnInit() {
    //this.loadScripts();
  }

  hasRoute(route: string) {
    return this._router.url.includes(route);
  }
}
