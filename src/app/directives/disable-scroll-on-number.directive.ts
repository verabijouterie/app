import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableScrollOnNumber]'
})
export class DisableScrollOnNumberDirective {

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const target = event.target as HTMLElement;
    if (document.activeElement === target) {
      event.preventDefault();
    }
  }
}