import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  title = 'my-app-angular';

  public router: string;

  constructor(private _router: Router){

         
        
    }
  ngOnInit() {
   
  }

  hasRoute(route: string) {
    return this._router.url.includes(route);
  }
}
