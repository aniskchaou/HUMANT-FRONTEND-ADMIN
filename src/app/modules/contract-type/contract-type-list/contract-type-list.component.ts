import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-type-list',
  templateUrl: './contract-type-list.component.html',
  styleUrls: ['./contract-type-list.component.css'],
})
export class ContractTypeListComponent implements OnInit {
  @Input() contractType;
  constructor() {}

  ngOnInit(): void {}
}
