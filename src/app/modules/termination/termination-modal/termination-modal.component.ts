import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-termination-modal',
  templateUrl: './termination-modal.component.html',
  styleUrls: ['./termination-modal.component.css'],
})
export class TerminationModalComponent extends URLLoader implements OnInit {
  @Input() id;
  @Output() refresh = new EventEmitter<string>();
  constructor() {
    super();
    this.loadScripts();
  }

  ngOnInit(): void {}

  closeModalAdd() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeAdd'
    )[0] as HTMLElement;
    element.click();
    this.refresh.emit();
  }

  closeModalEdit() {
    let element: HTMLElement = document.getElementsByClassName(
      'closeEdit'
    )[0] as HTMLElement;
    element.click();
  }
}
