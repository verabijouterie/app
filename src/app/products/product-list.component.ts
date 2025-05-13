import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Product } from '../interfaces/product.interface';
import { Category } from '../interfaces/category.interface';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { ProductComponent } from './product.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../services/products.service';
import { CategoriesService } from '../services/categories.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    DrawerComponent,
    ProductComponent,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  isDrawerOpen = false;
  skipDrawerAnimation = true;
  editMode = false;
  selectedProduct: Product | null = null;

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadData(): void {
    forkJoin({
      products: this.productsService.getProducts(),
      categories: this.categoriesService.getCategories()
    }).subscribe({
      next: (data) => {
        this.products = data.products;
        this.categories = data.categories;
      },
      error: (error) => {
        this.snackBar.open('Veriler yüklenirken bir hata oluştu', 'Kapat', { duration: 3000 });
      }
    });
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return '-';
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || '-';
  }

  openProductDrawer(): void {
    this.editMode = false;
    this.selectedProduct = null;
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.editMode = false;
    this.selectedProduct = null;
  }

  editProduct(product: Product): void {
    this.editMode = true;
    this.selectedProduct = product;
    this.isDrawerOpen = true;
  }

  onProductSubmit(product: Product): void {
    if (product.id) {
      this.productsService.updateProduct(product.id, product).subscribe({
        next: () => {
          this.snackBar.open('Ürün başarıyla güncellendi', 'Kapat', { duration: 3000 });
          this.onDrawerClose();
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open('Ürün güncellenirken bir hata oluştu', 'Kapat', { duration: 3000 });
        }
      });
    } else {
      this.productsService.createProduct(product).subscribe({
        next: () => {
          this.snackBar.open('Ürün başarıyla oluşturuldu', 'Kapat', { duration: 3000 });
          this.onDrawerClose();
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open('Ürün oluşturulurken bir hata oluştu', 'Kapat', { duration: 3000 });
        }
      });
    }
  }

  deleteProduct(product: Product): void {
    if (!product.id) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Ürünü Sil',
        message: `${product.name} ürününü silmek istediğinizden emin misiniz?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productsService.deleteProduct(product.id!).subscribe({
          next: () => {
            this.snackBar.open('Ürün başarıyla silindi', 'Kapat', { duration: 3000 });
            this.loadData();
          },
          error: (error) => {
            this.snackBar.open('Ürün silinirken bir hata oluştu', 'Kapat', { duration: 3000 });
          }
        });
      }
    });
  }
} 