import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/configs/URLLoader';

@Component({
  selector: 'app-resign',
  templateUrl: './resign.component.html',
  styleUrls: ['./resign.component.css']
})
export class ResignComponent extends URLLoader implements OnInit {

  showsummary:boolean=false
  showgraphic:boolean=false
  
  constructor() {
    super()
   }
  

ngOnInit() {
 super.loadScripts();
}

}
