import { Component, OnInit } from '@angular/core';
import { URLLoader } from 'src/app/main/configs/URLLoader';

@Component({
  selector: 'app-termination-modal',
  templateUrl: './termination-modal.component.html',
  styleUrls: ['./termination-modal.component.css'],
})
export class TerminationModalComponent extends URLLoader implements OnInit {
  constructor() {
    super();
    this.loadScripts();
  }

  ngOnInit(): void {}
}