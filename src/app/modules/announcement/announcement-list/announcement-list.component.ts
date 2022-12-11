import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrls: ['./announcement-list.component.css'],
})
export class AnnouncementListComponent implements OnInit {
  @Input() announcement;
  constructor() {}

  ngOnInit(): void {}
}
