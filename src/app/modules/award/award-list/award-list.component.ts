import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-award-list',
  templateUrl: './award-list.component.html',
  styleUrls: ['./award-list.component.css'],
})
export class AwardListComponent implements OnInit {
  @Input() award;
  constructor() {}

  ngOnInit(): void {}
}
