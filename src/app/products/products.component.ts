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
  skipDrawerAnimation = true;

  caratOptions = [24, 22, 21, 20, 18, 16, 14, 12, 10, 8];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      carat: [24, Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      inventory: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // TODO: Load products from service
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
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
        total24k: this.calculateTotal24k(formValue.weight, formValue.carat)
      };

      if (this.editMode) {
        const index = this.products.findIndex(p => p.id === this.selectedProductId);
        if (index !== -1) {
          this.products[index] = product;
        }
      } else {
        this.products.push(product);
      }

      this.onDrawerClose();
    }
  }

  editProduct(product: Product): void {
    this.editMode = true;
    this.selectedProductId = product.id;
    this.productForm.patchValue({
      name: product.name,
      carat: product.carat,
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

  calculateTotal24k(weight: number, carat: number): number {
    return (weight * carat) / 24;
  }
} 