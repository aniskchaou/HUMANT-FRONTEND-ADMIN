import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-employee',
  templateUrl: './modal-employee.component.html',
  styleUrls: ['./modal-employee.component.css'],
})
export class ModalEmployeeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    element.click();
  }
}
