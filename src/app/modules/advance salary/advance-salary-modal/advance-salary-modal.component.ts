import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-advance-salary-modal',
  templateUrl: './advance-salary-modal.component.html',
  styleUrls: ['./advance-salary-modal.component.css'],
})
export class AdvanceSalaryModalComponent implements OnInit {
  @Input() id;
  constructor() {}

  ngOnInit(): void {}

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'close'
    )[0] as HTMLElement;
    element.click();
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementsByClassName(
      'close'
    )[1] as HTMLElement;
    element.click();
  }
}
