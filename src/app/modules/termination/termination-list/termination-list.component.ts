import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-termination-list',
  templateUrl: './termination-list.component.html',
  styleUrls: ['./termination-list.component.css'],
})
export class TerminationListComponent implements OnInit {
  @Input() termination;

  constructor() {}

  ngOnInit(): void {}
}
