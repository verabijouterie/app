import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationEvent } from '@angular/animations';

@Component({
    selector: 'app-drawer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'md' | 'lg' | 'xl' | '2xl' | 'full' = 'md';
  @Input() skipAnimation = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() animationComplete = new EventEmitter<boolean>();

  onClose() {
    this.close.emit();
  }

  onTransitionEnd(event: any) {
    this.animationComplete.emit(this.isOpen);
  }
} 