import { UrlSegment } from '@angular/router';

export default class CONFIG {
  static URL_BASE = 'http://localhost:8080';
  public LANG = 'EN';

  public static instance: CONFIG = null;

  static getInstance(): CONFIG {
    return this.instance || (this.instance = new this());
  }
  public getLang() {
    return this.LANG;
  }

  public setLang(v) {
    this.LANG = v;
  }
}
