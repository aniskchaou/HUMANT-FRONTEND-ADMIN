import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStatus]',
})
export class StatusDirective {
  @Input() defaultColor: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.defaultColor) {
      this.setBgColor(this.defaultColor);
    } else {
      this.setBgColor('white');
    }
  }

  setBgColor(color: string) {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'backgroundColor',
      color
    );
  }
}
