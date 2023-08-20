import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-resign-modal',
  templateUrl: './resign-modal.component.html',
  styleUrls: ['./resign-modal.component.css'],
})
export class ResignModalComponent implements OnInit {
  constructor() {}
  @Input() id = undefined;

  ngOnInit(): void {}

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    element.click();
    // this.getAll();
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeEdit'
    )[0] as HTMLElement;
    element.click();
    // this.getAll();
  }
}
