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
import { CARAT_OPTIONS, CARAT_PURITY_MAP_GOLD, CARAT_PURITY_MAP_SCRAP } from '../config/constants';
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
  
  caratOptions = CARAT_OPTIONS.map(carat => Number(carat));
  caratPurityMapGold = CARAT_PURITY_MAP_GOLD;
  caratPurityMapScrap = CARAT_PURITY_MAP_SCRAP;

  formTransaction: Transaction = {
    type: this.type || 'Product',
    direction: this.direction || 'In',
    weight: 0,
    carat: undefined,
    amount: 0,
    quantity: 1,
    product: undefined,
    weight24k: 0,
    status: null
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
        
        this.handleProductCarat(this.formTransaction.product);
        this.handleProductWeight(this.formTransaction.product);

        this.formTransaction.weight = Number(this.transaction?.weight);
        this.formTransaction.carat = Number(this.transaction?.carat);
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
    const caratInfo = product.carat && product.carat > 0 ? `${product.carat} carat` : '';
    const weightInfo = product.weight && product.weight > 0 ? `${product.weight}g` : '';
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
      
      this.handleProductCarat(product);
      this.handleProductWeight(product);

      this.calculateTotal24KWeight();
    }
  }

  checkFormValidity() {
    if (this.formTransaction.type === 'Product') {
      return !this.formTransaction.product_id || 
             this.formTransaction.carat === undefined || 
             this.formTransaction.weight === undefined || 
             !this.formTransaction.quantity || 
             (!this.isWeightDisabled && this.formTransaction.weight <= 0) ||
             (!this.isCaratDisabled && this.formTransaction.carat === 0);
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
        const purity = this.caratPurityMapGold[this.formTransaction.carat as keyof typeof this.caratPurityMapGold] || 0;
        const weightAs24K = this.formTransaction.weight * purity * this.formTransaction.quantity;
        this.formTransaction.weight24k = parseFloat(weightAs24K.toFixed(4));
      } else {
        this.formTransaction.weight24k = 0;
      }
    }
    else if (this.formTransaction.type === 'Scrap') {
      if (this.formTransaction.weight && this.formTransaction.carat && 
          this.formTransaction.weight > 0 && this.formTransaction.carat > 0) {
        const purity = this.caratPurityMapScrap[this.formTransaction.carat as keyof typeof this.caratPurityMapScrap] || 0;
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
      direction: this.formTransaction.direction,
      weight: 0,
      carat: undefined,
      amount: 0,
      quantity: 1,
      product: undefined,
      weight24k: 0,
      status: null
    };
  }

  onCancel() {
    this.cancel.emit();
  }

  private handleProductCarat(product: Product) {


    if (product.carat !== null && product.carat !== undefined) {
      this.formTransaction.carat = Number(product.carat);
      this.isCaratDisabled = true;
    } else {
      this.formTransaction.carat = undefined;
      this.isCaratDisabled = false;
    }

    //Never allow the user to select 0 carat. that must allways be set from the products page
    if(!this.isCaratDisabled) {
      this.caratOptions = CARAT_OPTIONS.filter(carat => carat !== 0);
    } else {
      this.caratOptions = CARAT_OPTIONS;
    }
    

  }




  private handleProductWeight(product: Product) {
    // If product has weight explicitly set to 0, set it and disable the field
    if (product.weight !== null && product.weight !== undefined) {
      // If product has a non-zero weight, set it and disable the field
      this.formTransaction.weight = Number(product.weight);
      this.isWeightDisabled = true;
    } else {
      // If product has no weight set, enable the field and require > 0
      this.formTransaction.weight = 0;
      this.isWeightDisabled = false;
    }


  }
}