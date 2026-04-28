import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Service from '../interfaces/Service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthentificationService } from '../security/authentification.service';

@Injectable({
  providedIn: 'root',
})
export class HTTPService implements Service {
  public ID = new BehaviorSubject<string>(null);
  model = '';
  constructor(
    private http: HttpClient,
    private authentificationService: AuthentificationService
  ) {}

  private buildAuthHeader(includeContentType = false): HttpHeaders {
    return this.authentificationService.getAuthHeaders(includeContentType);
  }

  async update(url, data) {
    const body = JSON.stringify(data);
    await this.http
      .put(url, body, { headers: this.buildAuthHeader(true) })
      .toPromise();
  }

  getAll(url: string) {
    return this.http.get(url, { headers: this.buildAuthHeader() });
  }

  get(id: string) {
    return this.http.get(id, { headers: this.buildAuthHeader() });
  }

  async create(url, data) {
    const body = JSON.stringify(data);
    await this.http
      .post(url, body, { headers: this.buildAuthHeader(true) })
      .toPromise();
  }

  async postWithResponse<T>(url: string, data: unknown): Promise<T> {
    const body = JSON.stringify(data);
    return await this.http
      .post<T>(url, body, { headers: this.buildAuthHeader(true) })
      .toPromise();
  }

  async putWithResponse<T>(url: string, data: unknown): Promise<T> {
    const body = JSON.stringify(data);
    return await this.http
      .put<T>(url, body, { headers: this.buildAuthHeader(true) })
      .toPromise();
  }

  async postFormDataWithResponse<T>(url: string, data: FormData): Promise<T> {
    return await this.http
      .post<T>(url, data, { headers: this.buildAuthHeader() })
      .toPromise();
  }

  async getBlob(url: string): Promise<Blob> {
    return await this.http
      .get(url, { headers: this.buildAuthHeader(), responseType: 'blob' })
      .toPromise();
  }

  async filter(url, data) {
    const body = JSON.stringify(data);
    await this.http
      .post(url, body, { headers: this.buildAuthHeader(true) })
      .toPromise();
  }

  async remove(url) {
    await this.http
      .delete(url, {
        headers: this.buildAuthHeader(true),
      })
      .toPromise();
  }

  private title: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  setTitle(value: string) {
    this.title.next(value);
  }

  getTitle(): Observable<string> {
    return this.title.asObservable();
  }
}
