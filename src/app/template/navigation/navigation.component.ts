import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
})
export class NavigationComponent extends URLLoader implements OnInit {
  constructor() {
    super();
    //super.loadScripts();
  }

  ngOnInit(): void {}
}
