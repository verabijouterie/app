import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
} 