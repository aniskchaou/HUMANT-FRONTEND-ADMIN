import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.css'],
})
export class HolidayComponent extends URLLoader implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}
}
