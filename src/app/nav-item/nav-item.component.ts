import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-nav-item',
    imports: [CommonModule, RouterModule],
    template: `
    <a [routerLink]="link" 
       (click)="onClick()"
       class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
       [class.bg-gray-50]="isActive"
       [class.text-indigo-600]="isActive"
       [class.text-gray-700]="!isActive"
       [class.hover:bg-gray-50]="!isActive"
       [class.hover:text-indigo-600]="!isActive">
      <svg class="size-6 shrink-0" 
           [class.text-indigo-600]="isActive"
           [class.text-gray-400]="!isActive"
           [class.group-hover:text-indigo-600]="!isActive"
           fill="none" 
           viewBox="0 0 24 24" 
           stroke-width="1.5" 
           stroke="currentColor" 
           aria-hidden="true" 
           data-slot="icon">
        <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="icon" />
      </svg>
      {{ name }}
    </a>
  `
})
export class NavItemComponent {
  @Input() name: string = '';
  @Input() link: string = '';
  @Input() icon: string = '';
  @Input() isActive: boolean = false;
  @Output() itemClick = new EventEmitter<void>();

  onClick() {
    this.itemClick.emit();
  }
} 