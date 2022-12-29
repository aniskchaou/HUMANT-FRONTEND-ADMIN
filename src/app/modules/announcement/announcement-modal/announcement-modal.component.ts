import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-announcement-modal',
  templateUrl: './announcement-modal.component.html',
  styleUrls: ['./announcement-modal.component.css'],
})
export class AnnouncementModalComponent implements OnInit {
  @Input()
  id;
  constructor() {}

  ngOnInit(): void {}
}
