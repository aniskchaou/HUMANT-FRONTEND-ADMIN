import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.css'],
})
export class NoticeComponent extends URLLoader implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadScripts();
  }
}
