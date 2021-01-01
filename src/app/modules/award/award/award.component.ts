import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-award',
  templateUrl: './award.component.html',
  styleUrls: ['./award.component.css']
})
export class AwardComponent implements OnInit {

  constructor() { }

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
  }  
ngOnInit() {
 this.loadScripts();
}

}
