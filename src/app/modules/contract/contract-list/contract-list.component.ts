import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css'],
})
export class ContractListComponent implements OnInit {
  @Input() contract;
  constructor() {}

  ngOnInit(): void {}
}
