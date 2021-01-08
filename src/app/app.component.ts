import { Component } from '@angular/core';
import { Router } from '@angular/router';
import '@fortawesome/fontawesome-free/js/all.js';
import { URLLoader } from './configs/URLLoader';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends URLLoader {


  title = 'my-app-angular';

  public router: string;
 
  
  constructor(private _router: Router){

     super()    
        
    }


  /*
    loadScripts() {
      const dynamicScripts = [
       '../assets/scripts/jquery-1.9.1.min.js',
       '../assets/scripts/jquery-ui-1.10.1.custom.min.js',
       '../assets/bootstrap/js/bootstrap.min.js',
       '../assets/scripts/datatables/jquery.dataTables.js',
       '../assets/scripts/init.js'
      ];
      for (let i = 0; i < dynamicScripts.length; i++) {
        const node = document.createElement('script');
        node.src = dynamicScripts[i];
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        document.getElementsByTagName('app-root')[0].appendChild(node);
      }
    }  */
  ngOnInit() {
   this.loadScripts();
  }


  
  hasRoute(route: string) {
    return this._router.url.includes(route);
  }
}
