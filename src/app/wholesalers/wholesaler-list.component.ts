import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Wholesaler } from '../interfaces/wholesaler.interface';

@Component({
  selector: 'app-wholesaler-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './wholesaler-list.component.html'
})
export class WholesalerListComponent {
  @Input() wholesalers: Wholesaler[] = [];
  @Output() edit = new EventEmitter<Wholesaler>();
  @Output() delete = new EventEmitter<number>();

} 