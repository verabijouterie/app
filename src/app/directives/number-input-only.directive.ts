import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumberInputOnly]'
})
export class NumberInputOnlyDirective {

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text');
    
    if (pastedText) {
      // Only allow numbers (regex checks if string contains only digits)
      if (!/^\d*$/.test(pastedText)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
} 