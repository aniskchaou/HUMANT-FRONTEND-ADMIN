import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/configs/URLLoader';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent  extends URLLoader implements OnInit {

  constructor() {
    super()
   }
  

ngOnInit() {
 super.loadScripts();
}

}
