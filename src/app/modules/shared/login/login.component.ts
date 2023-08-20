import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { HTTPService } from 'src/app/main/services/HTTPService';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent extends URLLoader implements OnInit {
  username = 'admin';
  password = 'admin';
  invalidLogin = false;
  errorMessage = '';
  @Output() reloadMenu = new EventEmitter();
  //settings$: Settings;
  //menuI18n: Settings;
  buttonLoginClicked = false;

  constructor(
    private router: Router,
    //private loginservice: AuthentificationService,
    private httpService: HTTPService
  ) {
    super();
    //super.loadScripts();
  }

  ngOnInit(): void {
    sessionStorage.setItem('username', 'admin');
    sessionStorage.setItem('password', 'admin');
    //super.loadScripts();
  }

  doLogin(loginform: NgForm) {
    this.buttonLoginClicked = true;
    if (
      loginform.value.username === 'admin' &&
      loginform.value.password === 'admin'
    ) {
      //this.loadScripts();
      this.httpService.setTitle('load');
      this.router.navigate(['/dashboard']);

      /* .then(() => {
          this.loadScripts();
          this.router.navigate(['/dashboard']);
        }); */
    }
    /*  this.loginservice
      .authenticate(loginform.value.username, loginform.value.password)
      .subscribe(
        (data) => {
          if (data) {
            let username = sessionStorage.setItem(
              'username',
              loginform.value.username
            );
            let password = sessionStorage.setItem(
              'password',
              loginform.value.password
            );
            super.show('StockBay', 'Welcome !', 'success');
            // super.loadScripts();
            this.buttonLoginClicked = false;
            this.invalidLogin = false;
          
            this.router.navigate(['/dashboard']);
          }
        },
        (error) => {
          this.invalidLogin = true;
          this.errorMessage = error.message;
          super.show(
            'Error Authentification',
            'Error password or username',
            'warning'
          );
        }
      ); */
  }
}
