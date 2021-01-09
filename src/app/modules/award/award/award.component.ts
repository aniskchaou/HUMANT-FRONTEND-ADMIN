import { Component, OnInit } from '@angular/core';
import { URLLoader } from './../../../configs/URLLoader';


@Component({
  selector: 'app-award',
  templateUrl: './award.component.html',
  styleUrls: ['./award.component.css']
})
export class AwardComponent extends URLLoader implements OnInit {

  
  showsummary:boolean=false
  showgraphic:boolean=false
  
  constructor() {
    super()
   }
  

ngOnInit() {
 super.loadScripts();
}

}
