import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advance-salary-list',
  templateUrl: './advance-salary-list.component.html',
  styleUrls: ['./advance-salary-list.component.css'],
})
export class AdvanceSalaryListComponent implements OnInit {
  @Input() salary;
  constructor() {}

  ngOnInit(): void {}
}
