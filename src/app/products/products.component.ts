import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Product } from '../interfaces/product.interface';
import { ProductListComponent } from './product-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { CARAT_OPTIONS, CARAT_PURITY_MAP } from '../config/constants';
import { ProductsService } from '../services/products.service';
import { CategoriesService } from '../services/categories.service';
import { Category } from '../interfaces/category.interface';
import { Observable, of, forkJoin } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

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
    MatAutocompleteModule,
    ProductListComponent,
    DrawerComponent
  ],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  productForm: FormGroup;
  editMode = false;
  selectedProductId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  caratOptions = CARAT_OPTIONS;
  caratPurityMap = CARAT_PURITY_MAP;
  categoryControl = new FormControl<string | Category>('');
  filteredCategories: Observable<Category[]>;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService
  ) {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      carat: [null],
      weight: [null],
      category_id: [null, Validators.required]
    });

    this.categoryControl = new FormControl<string | Category>('');
    this.filteredCategories = of([]);
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Initialize filteredCategories with the loaded categories
        this.filteredCategories = this.categoryControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const name = typeof value === 'string' ? value : value?.name || '';
            return name ? this._filterCategories(name) : this.categories;
          })
        );
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private _filterCategories(value: string): Category[] {
    const filterValue = value.toLowerCase();
    return this.categories.filter(category => 
      category.name.toLowerCase().includes(filterValue)
    );
  }

  displayCategoryFn = (category: Category | string): string => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.name;
  }

  onCategorySelected(event: any) {
    const category = event.option.value;
    if (category) {
      this.productForm.patchValue({
        category_id: category.id
      });
    }
  }

  loadProducts(): void {
    this.productsService.getProducts().pipe(
      switchMap(products => {
        // Get unique category IDs
        const categoryIds = [...new Set(products
          .filter(p => p.category_id)
          .map(p => p.category_id))] as number[];
        
        if (categoryIds.length === 0) {
          return of(products);
        }

        // Fetch all categories in parallel
        return forkJoin(
          categoryIds.map(id => this.categoriesService.getCategory(id))
        ).pipe(
          map(categories => {
            // Create a map of category ID to category
            const categoryMap = new Map(categories.map(c => [c.id, c]));
            
            // Map categories to products
            return products.map(product => ({
              ...product,
              category: product.category_id ? categoryMap.get(product.category_id) : undefined
            }));
          })
        );
      })
    ).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  openProductDrawer(): void {
    if (!this.editMode) {
      this.productForm.reset({
        carat: null,
        weight: null,
        category_id: null
      });
    }
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
        id: this.editMode ? this.selectedProductId! : null,
        weight24k: formValue.weight && formValue.carat ? 
          this.calculateTotal24k(formValue.weight, formValue.carat) : undefined
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
      carat: product.carat ? parseInt(product.carat.toString()) : null,
      weight: product.weight,
      category_id: product.category_id
    });

    // Set the initial category value in the autocomplete
    if (product.category) {
      this.categoryControl.setValue(product.category);
    } else if (product.category_id) {
      // If we have the ID but not the category object, fetch it
      this.categoriesService.getCategory(product.category_id).subscribe({
        next: (category) => {
          this.categoryControl.setValue(category);
        },
        error: (error) => {
          console.error('Error loading category:', error);
        }
      });
    }

    this.openProductDrawer();
  }

  deleteProduct(id: number): void {
    this.productsService.deleteProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
      }
    });
  }

  resetForm(): void {
    this.productForm.reset({
      carat: null,
      weight: null,
      category_id: null
    });
    this.categoryControl.reset();
    this.editMode = false;
    this.selectedProductId = null;
  }

  calculateTotal24k(weight: number | null, carat: number | null) {
    if (!weight || !carat) return undefined;
    const purity = this.caratPurityMap[carat as keyof typeof this.caratPurityMap] || 0;
    const weight24K = weight * purity;
    return parseFloat(weight24K.toFixed(4));
  }
} 