import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-complain-list',
  templateUrl: './complain-list.component.html',
  styleUrls: ['./complain-list.component.css'],
})
export class ComplainListComponent implements OnInit {
  @Input() complain;
  constructor() {}

  ngOnInit(): void {}
}
