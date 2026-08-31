import { UrlSegment } from '@angular/router';

export default class CONFIG {
  static URL_BASE = CONFIG.resolveBaseUrl();
  public LANG = 'EN';

  public static instance: CONFIG = null;

  private static resolveBaseUrl(): string {
    if (typeof window === 'undefined' || !window.location || window.location.origin === 'null') {
      return 'http://localhost:8080';
    }

    const { protocol, hostname, port, origin } = window.location;
    const isLocalFrontend = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalFrontend && (port === '4200' || port === '4201')) {
      return `${protocol}//${hostname}:8080`;
    }

    return origin;
  }

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
