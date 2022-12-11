import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent extends URLLoader implements OnInit {
  showsummary: boolean = false;
  showgraphic: boolean = false;

  constructor() {
    super();
  }

  ngOnInit() {
    super.loadScripts();
  }
}
