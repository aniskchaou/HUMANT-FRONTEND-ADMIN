import { Component, OnInit } from '@angular/core';
import { URLLoader } from './../../../configs/URLLoader';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends URLLoader implements OnInit {

  constructor() { 
    super()
  }

  ngOnInit(): void {
    super.loadScripts()
  }

}
