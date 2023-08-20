import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-award-modal',
  templateUrl: './award-modal.component.html',
  styleUrls: ['./award-modal.component.css'],
})
export class AwardModalComponent implements OnInit {
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
    element.click();
  }
}
