import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import CONFIG from '../urls/urls';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  constructor(private httpClient: HttpClient) {}

  authenticate(username, password) {
    console.log(username);
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(username + ':' + password),
    });
    return this.httpClient
      .get(CONFIG.URL_BASE + '/member/all', { headers })
      .pipe((userData) => {
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('password', password);
        console.log(userData);
        return userData;
      });
  }

  isUserLoggedIn() {
    let user = sessionStorage.getItem('username');
    console.log(user);
    if (user == null) {
      return false;
    } else {
      return true;
    }
  }

  logOut() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('password');
  }
}
