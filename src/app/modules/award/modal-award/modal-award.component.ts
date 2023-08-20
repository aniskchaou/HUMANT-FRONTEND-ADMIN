import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-award',
  templateUrl: './modal-award.component.html',
  styleUrls: ['./modal-award.component.css'],
})
export class ModalAwardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  closeModalEdit() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeEdit'
    )[0] as HTMLElement;
    element.click();
  }

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    console.log('sfsdfsdf');
    element.click();
  }
}
