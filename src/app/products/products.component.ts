import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../interfaces/product.interface';
import { ProductListComponent } from './product-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { CARAT_OPTIONS, CARAT_PURITY_MAP } from '../config/constants';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ProductListComponent,
    DrawerComponent
  ],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  editMode = false;
  selectedProductId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = false;
  currentProductId: string | null = null;
  caratOptions = CARAT_OPTIONS;
  caratPurityMap = CARAT_PURITY_MAP;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService
  ) {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      carat: [24, Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      inventory: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  openProductDrawer(): void {
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      const product: Product = {
        ...formValue,
        id: this.editMode ? this.selectedProductId! : Date.now(),
        weight24k: this.calculateTotal24k(formValue.weight, formValue.carat)
      };

      if (this.editMode && product.id) {
        this.productsService.updateProduct(product.id, product).subscribe({
          next: (updatedProduct) => {
            this.loadProducts();
            this.onDrawerClose();
          },
          error: (error) => {
            console.error('Error updating product:', error);
          }
        });
      } else {
        this.productsService.createProduct(product).subscribe({
          next: (newProduct) => {
            this.loadProducts();
            this.onDrawerClose();
          },
          error: (error) => {
            console.error('Error creating product:', error);
          }
        });
      }
    }
  }

  editProduct(product: Product): void {
    this.editMode = true;
    this.selectedProductId = product.id || null;
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      carat: Number(product.carat),
      weight: product.weight,
      inventory: product.inventory
    });
    this.openProductDrawer();
  }

  deleteProduct(id: number): void {
    this.products = this.products.filter(product => product.id !== id);
  }

  resetForm(): void {
    this.productForm.reset({
      carat: 24,
      weight: 0,
      inventory: 0
    });
    this.editMode = false;
    this.selectedProductId = null;
  }

  calculateTotal24k(weight: number, carat: number) {
    const purity = this.caratPurityMap[carat as keyof typeof this.caratPurityMap] || 0;
    const weight24K = weight * purity;
    return parseFloat(weight24K.toFixed(4));
  }
} 