import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../interfaces/transaction.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../interfaces/product.interface';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CARAT_OPTIONS, CARAT_PURITY_MAP } from '../config/constants';
import { ProductsService } from '../services/products.service';

@Component({
    selector: 'app-transaction',
    standalone: true,
    templateUrl: './transaction.component.html',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatAutocompleteModule
    ]
})
export class TransactionComponent implements OnInit, OnChanges {
  @Output() transactionSubmit = new EventEmitter<Transaction>();
  @Output() cancel = new EventEmitter<void>();
  @Input() transaction?: Transaction;
  @Input() type?: 'Product' | 'Scrap' | 'Cash' | 'Bank';
  @Input() direction?: 'In' | 'Out';
  
  products: Product[] = [];
  selectedProduct: Product | null = null;
  productControl = new FormControl<string | Product>('');
  filteredProducts: Observable<Product[]>;
  
  caratOptions = CARAT_OPTIONS;
  caratPurityMap = CARAT_PURITY_MAP;

  formTransaction: Transaction = {
    type: 'Product',
    direction: 'In',
    weight: 0,
    carat: undefined,
    amount: 0,
    quantity: 1,
    product: undefined,
    weight24k: 0
  };

  isCaratDisabled = false;
  isWeightDisabled = false;

  private productControlSubscription?: Subscription;

  constructor(private productsService: ProductsService) {
    this.productControl = new FormControl<string | Product>('');
    this.filteredProducts = of([]); // Initialize with empty observable
  }

  ngOnInit() {
    this.loadProducts();
    if (this.transaction) {
      this.formTransaction = { ...this.transaction };
      if (this.formTransaction.product) {
        this.selectedProduct = this.formTransaction.product;
        this.productControl.setValue(this.formTransaction.product);
      }
    }
    
    // Initialize with input values if provided
    if (this.type) {
      this.formTransaction.type = this.type;
    }
    if (this.direction) {
      this.formTransaction.direction = this.direction;
    }

    // Subscribe to productControl value changes
    this.productControlSubscription = this.productControl.valueChanges.subscribe(value => {
      if (!value) {
        // Clear product-related fields when input is cleared
        this.selectedProduct = null;
        this.formTransaction.product = undefined;
        this.formTransaction.product_id = undefined;
        this.formTransaction.carat = undefined;
        this.formTransaction.weight = 0;
        this.isCaratDisabled = false;
        this.isWeightDisabled = false;
        this.calculateTotal24KWeight();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transaction'] && this.transaction) {
      this.formTransaction = { ...this.transaction };
      if (this.formTransaction.product) {
        this.selectedProduct = this.formTransaction.product;
        this.productControl.setValue(this.formTransaction.product);
      }
    }
    
    // Handle changes to type and direction inputs
    if (changes['type'] && this.type) {
      this.formTransaction.type = this.type;
    }
    if (changes['direction'] && this.direction) {
      this.formTransaction.direction = this.direction;
    }
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.productControlSubscription) {
      this.productControlSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        // Reinitialize filteredProducts with the loaded products
        this.filteredProducts = this.productControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const name = typeof value === 'string' ? value : value?.name || '';
            return name ? this._filter(name) : this.products;
          })
        );
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  private _filter(value: string): Product[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(filterValue)
    );
  }


  displayFn = (product: Product | string): string => {    
    if (!product) return '';
    if (typeof product === 'string') return product;
    const caratInfo = product.carat ? `${product.carat} carat` : '';
    const weightInfo = product.weight ? `${product.weight}g` : '';
    const separator = caratInfo && weightInfo ? ', ' : '';
    const details = caratInfo || weightInfo ? ` (${caratInfo}${separator}${weightInfo})` : '';
    return `${product.name}${details}`;
  }

  onProductSelected(event: any) {
    const product = event.option.value;
    if (product) {
      this.selectedProduct = product;
      this.formTransaction.product = product;
      this.formTransaction.product_id = product.id;
      
      // If product has carat, set it and disable the field
      if (product.carat) {
        this.formTransaction.carat = Number(product.carat);
        this.isCaratDisabled = true;
      } else {
        this.formTransaction.carat = undefined;
        this.isCaratDisabled = false;
      }

      // If product has weight, set it and disable the field
      if (product.weight) {
        this.formTransaction.weight = Number(product.weight);
        this.isWeightDisabled = true;
      } else {
        this.formTransaction.weight = 0;
        this.isWeightDisabled = false;
      }

      this.calculateTotal24KWeight();
    }
  }

  checkFormValidity() {
    if (this.formTransaction.type === 'Product') {
      return !this.formTransaction.product_id || 
             !this.formTransaction.carat || 
             !this.formTransaction.weight || 
             !this.formTransaction.quantity;
    } else if (this.formTransaction.type === 'Scrap') {
      return !this.formTransaction.weight24k || this.formTransaction.weight24k === 0;
    } else if (this.formTransaction.type === 'Cash' || this.formTransaction.type === 'Bank') {
      return !this.formTransaction.amount || this.formTransaction.amount === 0;
    }
    return true;
  }

  selectQuantity(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  selectWeightInput(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  selectAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  calculateTotal24KWeight() {
    if (this.formTransaction.type === 'Product') {
      if (this.formTransaction.carat && this.formTransaction.weight && this.formTransaction.quantity) {
        const purity = this.caratPurityMap[this.formTransaction.carat as keyof typeof this.caratPurityMap] || 0;
        const weightAs24K = this.formTransaction.weight * purity * this.formTransaction.quantity;
        this.formTransaction.weight24k = parseFloat(weightAs24K.toFixed(4));
      } else {
        this.formTransaction.weight24k = 0;
      }
    }
    else if (this.formTransaction.type === 'Scrap') {
      if (this.formTransaction.weight && this.formTransaction.carat && 
          this.formTransaction.weight > 0 && this.formTransaction.carat > 0) {
        const purity = this.caratPurityMap[this.formTransaction.carat as keyof typeof this.caratPurityMap] || 0;
        const weightAs24K = this.formTransaction.weight * purity;
        this.formTransaction.weight24k = parseFloat(weightAs24K.toFixed(4));
      } else {
        this.formTransaction.weight24k = 0;
      } 
    }
    else {
      this.formTransaction.weight24k = 0;
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.transactionSubmit.emit(this.formTransaction);
    if (!this.transaction) {
      this.resetForm();
    }
  }

  resetForm() {
    this.selectedProduct = null;
    this.productControl.setValue('');
    this.isCaratDisabled = false;
    this.isWeightDisabled = false;
    this.formTransaction = {
      id: undefined,
      type: this.formTransaction.type,
      direction: 'In',
      weight: 0,
      carat: undefined,
      amount: 0,
      quantity: 1,
      product: undefined,
      weight24k: 0
    };
  }

  onCancel() {
    this.cancel.emit();
  }
}