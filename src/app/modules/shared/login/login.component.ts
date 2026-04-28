import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { URLLoader } from 'src/app/main/configs/URLLoader';
import { AccessControlService } from 'src/app/main/security/access-control.service';
import { AuthentificationService } from 'src/app/main/security/authentification.service';

interface DemoAccount {
  label: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent extends URLLoader implements OnInit {
  username = 'admin';
  password = 'admin';
  rememberMe = false;
  invalidLogin = false;
  errorMessage = '';
  buttonLoginClicked = false;
  readonly demoAccounts: DemoAccount[] = [
    { label: 'Admin workspace', username: 'admin', password: 'admin' },
    { label: 'HR workspace', username: 'hr', password: 'hr123' },
    { label: 'Manager workspace', username: 'manager', password: 'manager123' },
    { label: 'Recruiter workspace', username: 'recruiter', password: 'recruit123' },
    { label: 'Employee profile', username: 'emp', password: '123' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authentificationService: AuthentificationService,
    private accessControlService: AccessControlService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.authentificationService.isUserLoggedIn()) {
      this.navigateToWorkspace();
    }
  }

  doLogin(loginform: NgForm): void {
    this.buttonLoginClicked = true;
    this.invalidLogin = false;
    this.errorMessage = '';

    if (loginform.invalid) {
      loginform.form.markAllAsTouched();
      this.buttonLoginClicked = false;
      return;
    }

    const username = (loginform.value.username || '').trim();
    const password = loginform.value.password || '';

    this.authentificationService
      .authenticate(username, password, this.rememberMe)
      .subscribe(
        () => {
          this.invalidLogin = false;
          this.buttonLoginClicked = false;
          this.navigateToWorkspace();
        },
        (error: HttpErrorResponse) => {
          this.authentificationService.logOut();
          this.invalidLogin = true;
          this.errorMessage =
            error.status === 401
              ? 'The username or password is incorrect. Use one of the available demo accounts.'
              : 'The authentication service is unavailable right now. Check the backend connection and try again.';
          this.buttonLoginClicked = false;
        }
      );
  }

  useDemoAccount(account: DemoAccount): void {
    this.username = account.username;
    this.password = account.password;
    this.invalidLogin = false;
    this.errorMessage = '';
  }

  private navigateToWorkspace(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination =
      returnUrl && this.accessControlService.canAccessRoute(returnUrl)
        ? returnUrl
        : this.accessControlService.getDefaultRoute();
    this.router.navigateByUrl(destination);
  }
}
