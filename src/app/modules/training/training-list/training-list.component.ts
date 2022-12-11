import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.css'],
})
export class TrainingListComponent implements OnInit {
  @Input() training;
  constructor() {}

  ngOnInit(): void {}
}
