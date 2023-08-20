import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-award-type-modal',
  templateUrl: './award-type-modal.component.html',
  styleUrls: ['./award-type-modal.component.css'],
})
export class AwardTypeModalComponent implements OnInit {
  constructor() {}
  @Input()
  id = 0;

  ngOnInit(): void {}

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'close'
    )[0] as HTMLElement;
    element.click();
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementById(
      'closeEdit'
    ) as HTMLElement;
    console.log(element);
    element.click();
  }
}
