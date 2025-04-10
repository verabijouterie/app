import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Category } from '../interfaces/category.interface';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './category-list.component.html'
})
export class CategoryListComponent {
  @Input() categories: Category[] = [];
  @Output() edit = new EventEmitter<Category>();
  @Output() delete = new EventEmitter<number>();

  onDelete(id: number): void {
    this.delete.emit(id);
  }
} 