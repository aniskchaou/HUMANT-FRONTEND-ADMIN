import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-education-level-list',
  templateUrl: './education-level-list.component.html',
  styleUrls: ['./education-level-list.component.css'],
})
export class EducationLevelListComponent implements OnInit {
  @Input() educationLevel;
  constructor() {}

  ngOnInit(): void {}
}
