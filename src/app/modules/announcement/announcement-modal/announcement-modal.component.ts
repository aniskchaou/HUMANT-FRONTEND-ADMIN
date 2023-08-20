import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-announcement-modal',
  templateUrl: './announcement-modal.component.html',
  styleUrls: ['./announcement-modal.component.css'],
})
export class AnnouncementModalComponent implements OnInit {
  @Input()
  id;
  @Output() refresh = new EventEmitter<string>();
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
    this.refresh.emit();
  }
}
