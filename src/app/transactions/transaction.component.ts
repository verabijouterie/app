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
import { mockProducts } from '../mockup/mock-products';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CARAT_OPTIONS, CARAT_PURITY_MAP } from '../config/constants';

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
  
  products: Product[] = mockProducts;
  selectedProduct: Product | null = null;
  productControl = new FormControl<string | Product>('');
  filteredProducts: Observable<Product[]>;
  
  caratOptions = CARAT_OPTIONS;
  caratPurityMap = CARAT_PURITY_MAP;

  formTransaction: Transaction = {
    type: 'Product',
    direction: 'In',
    weight: 0,
    carat: 24,
    amount: 0,
    quantity: 1,
    product: undefined,
    total24KWeight: 0
  };

  constructor() {
    // Initialize filteredProducts
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name || '';
        return this._filter(name);
      })
    );
  }

  ngOnInit() {
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

  private _filter(value: string): Product[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(filterValue)
    );
  }

  displayFn = (product: Product | string): string => {
    if (!product) return '';
    if (typeof product === 'string') return product;
    return `${product.name} (${product.carat} carat, ${product.weight}g)`;
  }

  onProductSelected(event: any) {
    const product = event.option.value;
    if (product) {
      this.selectedProduct = product;
      this.formTransaction.product = product;
      this.formTransaction.weight = product.weight;
      this.formTransaction.carat = product.carat;
      this.calculateTotal24KWeight();
    }
  }

  checkFormValidity() {
    return (this.formTransaction.type === 'Product' && (!this.formTransaction.total24KWeight || this.formTransaction.total24KWeight === 0)) ||
           (this.formTransaction.type === 'Scrap' && (!this.formTransaction.total24KWeight || this.formTransaction.total24KWeight === 0)) ||
           ((this.formTransaction.type === 'Cash' || this.formTransaction.type === 'Bank') && (!this.formTransaction.amount || this.formTransaction.amount === 0));
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
      if (this.formTransaction.product) {
        const quantity = this.formTransaction.quantity || 1;
        this.formTransaction.total24KWeight = parseFloat((quantity * this.formTransaction.product.weight24k).toFixed(4));
      } else {
        this.formTransaction.total24KWeight = 0;
      }
    }
    else if (this.formTransaction.type === 'Scrap') {
      if (this.formTransaction.weight && this.formTransaction.carat && 
          this.formTransaction.weight > 0 && this.formTransaction.carat > 0) {
        const purity = this.caratPurityMap[this.formTransaction.carat as keyof typeof this.caratPurityMap] || 0;
        const weightAs24K = this.formTransaction.weight * purity;
        this.formTransaction.total24KWeight = parseFloat(weightAs24K.toFixed(4));
      } else {
        this.formTransaction.total24KWeight = 0;
      } 
    }
    else {
      this.formTransaction.total24KWeight = 0;
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
    this.formTransaction = {
      id: undefined,
      type: this.formTransaction.type,
      direction: 'In',
      weight: 0,
      carat: 24,
      amount: 0,
      quantity: 1,
      product: undefined,
      total24KWeight: 0
    };
  }

  onCancel() {
    this.cancel.emit();
  }
}