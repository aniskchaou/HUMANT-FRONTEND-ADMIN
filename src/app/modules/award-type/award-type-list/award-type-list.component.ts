import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-award-type-list',
  templateUrl: './award-type-list.component.html',
  styleUrls: ['./award-type-list.component.css'],
})
export class AwardTypeListComponent implements OnInit {
  @Input() awardType;
  constructor() {}

  ngOnInit(): void {}
}
