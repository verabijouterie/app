import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../interfaces/product.interface';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<number>();

  constructor(private productsService: ProductsService) {}

  onDelete(id: number): void {
    this.productsService.deleteProduct(id).subscribe({
      next: () => {
        this.delete.emit(id);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
      }
    });
  }
} 