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

@Component({
    selector: 'app-transaction',
    standalone: true,
    template: `
    <div class="max-w-3xl mx-auto px-4 py-10">
      <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-8">
        <p class="text-base text-gray-500 mb-8">Create a new transaction.</p>

        <form (ngSubmit)="onSubmit($event)" class="space-y-8">
          <div class="grid grid-cols-1 gap-6">
            @if (!type) {
              <div class="space-y-1.5">
                <label for="type" class="block text-sm font-medium text-gray-900">Type</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-select [(ngModel)]="formTransaction.type" name="type" (selectionChange)="resetForm()">
                    <mat-option value="Product">Product</mat-option>
                    <mat-option value="Scrap">Scrap</mat-option>
                    <mat-option value="Cash">Cash</mat-option>
                    <mat-option value="Bank">Bank</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            }

            @if (!direction) {
              <div class="space-y-1.5">
                <label for="direction" class="block text-sm font-medium text-gray-900">Direction</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-select [(ngModel)]="formTransaction.direction" name="direction">
                    <mat-option value="In">In</mat-option>
                    <mat-option value="Out">Out</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            }

            @if (formTransaction.type === 'Product') {
              <div class="space-y-1.5">
                <label for="product" class="block text-sm font-medium text-gray-900">Product</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <input type="text" matInput [formControl]="productControl" [matAutocomplete]="auto"
                    placeholder="Select a product">
                  <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onProductSelected($event)">
                    <mat-option *ngFor="let product of filteredProducts | async" [value]="product">
                      {{product.name}} ({{product.carat}} carat, {{product.weight}}g)
                    </mat-option>
                  </mat-autocomplete>
                </mat-form-field>
              </div>

              <div class="space-y-1.5">
                <label for="quantity" class="block text-sm font-medium text-gray-900">Quantity</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <input matInput type="number" name="quantity" [(ngModel)]="formTransaction.quantity" min="1"
                    step="1" (focus)="selectQuantity($event)" (input)="calculateTotal24KWeight()">
                </mat-form-field>
              </div>
            }

            @if (formTransaction.type === 'Cash' || formTransaction.type === 'Bank') {
              <div class="space-y-1.5">
                <label for="amount" class="block text-sm font-medium text-gray-900">Amount</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <input matInput type="number" [(ngModel)]="formTransaction.amount" min="0" step="0.01"
                    name="amount" (focus)="selectAmountInput($event)">
                  <span matSuffix>EUR</span>
                </mat-form-field>
              </div>
            }

            @if (formTransaction.type === 'Scrap') {
              <div class="space-y-1.5">
                <label for="carat" class="block text-sm font-medium text-gray-900">Carat</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <mat-select [(ngModel)]="formTransaction.carat" name="carat" (selectionChange)="calculateTotal24KWeight()">
                    <mat-option *ngFor="let carat of caratOptions" [value]="carat">
                      {{ carat }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="space-y-1.5">
                <label for="weight" class="block text-sm font-medium text-gray-900">Weight (grams)</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <input matInput type="number" min="0" step="0.01" [(ngModel)]="formTransaction.weight" name="weight"
                    (input)="calculateTotal24KWeight()" (focus)="selectWeightInput($event)">
                </mat-form-field>
              </div>
            }

            @if (formTransaction.type === 'Product' || formTransaction.type === 'Scrap') {
              <div class="space-y-1.5">
                <label for="total24KWeight" class="block text-sm font-medium text-gray-900">Total Weight as 24K (grams)</label>
                <mat-form-field appearance="outline" subscriptSizing="dynamic" class="w-full">
                  <input matInput type="number" [value]="formTransaction.total24KWeight" readonly>
                </mat-form-field>
              </div>
            }
          </div>

          <div class="flex items-center justify-end gap-x-6 pt-6 border-t border-gray-900/10">
            <button type="button" (click)="onCancel()"
              class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 hover:text-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              [disabled]="checkFormValidity()">
              {{ transaction ? 'Update' : 'Create' }} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
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
  
  caratOptions: number[] = [24, 22, 21, 20, 18, 16, 14, 12, 10, 8];

  caratPurityMap = {
    24: 0.999,
    22: 0.916,
    21: 0.875,
    20: 0.833,
    18: 0.750,
    16: 0.667,
    14: 0.585,
    12: 0.500,
    10: 0.417,
    8: 0.333
  };

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
        this.formTransaction.total24KWeight = parseFloat((quantity * this.formTransaction.product.total24k).toFixed(4));
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