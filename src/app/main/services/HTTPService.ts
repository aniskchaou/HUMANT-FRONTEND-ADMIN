import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Service from '../interfaces/Service';
import CONFIG from '../urls/urls';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HTTPService implements Service {
  public ID = new BehaviorSubject<string>(null);
  headers = { 'content-type': 'application/json' };
  model = '';
  header = new HttpHeaders({
    Authorization:
      'Basic ' +
      btoa(
        //sessionStorage.getItem('username') +
        'admin:admin' //+
        //  sessionStorage.getItem('password')
      ),
  });
  constructor(private http: HttpClient) {}
  async update(url, data) {
    await this.http.put(url, data);
  }
  getAll(url: string) {
    return this.http.get(url, { headers: this.header });
  }
  get(id: string) {
    return this.http.get(id, { headers: this.header });
  }
  async create(url, data) {
    const body = JSON.stringify(data);
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    await this.http.post(url, body, { headers: headers }).toPromise();
  }

  async filter(url, data) {
    const body = JSON.stringify(data);
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization:
        'Basic ' +
        btoa(
          sessionStorage.getItem('username') +
            ':' +
            sessionStorage.getItem('password')
        ),
    });
    await this.http.post(url, body, { headers: headers }).toPromise();
  }

  async remove(url) {
    const headers = new HttpHeaders({
      'content-type': 'application/json',
      Authorization:
        'Basic ' +
        btoa(
          sessionStorage.getItem('username') +
            ':' +
            sessionStorage.getItem('password')
        ),
    });
    await this.http
      .delete(url, {
        headers: headers,
      })
      .toPromise();
  }
}
