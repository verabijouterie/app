import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../interfaces/transaction.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Product } from '../interfaces/product.interface';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { map, sequenceEqual, startWith } from 'rxjs/operators';
import { CARAT_OPTIONS, CARAT_PURITY_MAP_GOLD, CARAT_PURITY_MAP_SCRAP } from '../config/constants';
import { ProductsService } from '../services/products.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Wholesaler } from '../interfaces/wholesaler.interface';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { STATUS_OPTIONS } from '../config/constants';
import { DisableScrollOnNumberDirective } from '../directives/disable-scroll-on-number.directive'; // adjust path as needed


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
    MatAutocompleteModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDatepickerModule,
    DisableScrollOnNumberDirective
  ],
  providers: [
    provideNativeDateAdapter()
  ],
})
export class TransactionComponent implements OnInit, OnChanges {
  @Output() transactionSubmit = new EventEmitter<Transaction>();
  @Output() cancel = new EventEmitter<void>();
  @Input() transaction?: Transaction;
  @Input() type!: 'Product' | 'Scrap' | 'Cash' | 'Bank' | 'Money';
  @Input() direction!: 'In' | 'Out';
  @Input() context!: 'Supply' | 'Order' | 'Scenario';
  @Input() agreedGoldRate!: number;
  @Input() wholesaler?: Wholesaler;
  @Input() isOpen = false;
  @Input() isAnimationComplete = false;

  is_editing = false;

  products: Product[] = [];
  selectedProduct: Product | null = null;
  productControl = new FormControl<string | Product>('');
  filteredProducts: Observable<Product[]>;


  statusOptions = STATUS_OPTIONS;

  caratOptions = CARAT_OPTIONS.map(carat => Number(carat));
  caratPurityMapGold = CARAT_PURITY_MAP_GOLD;
  caratPurityMapScrap = CARAT_PURITY_MAP_SCRAP;

  today: Date = new Date();
  formTransaction: Transaction = {
    id: null,
    date: this.today.toISOString(),
    type: this.type,
    direction: this.direction,

    agreed_milliemes: 0,
    agreed_price: 0,
    agreed_weight24k: 0,

    weight_brut: 0,
    weight_brut_total: 0,
    carat: null,
    amount: 0,
    quantity: 1,
    product: null,
    product_id: null,
    weight24k: 0,
    status: null,
    paiable_as_cash_only: false
  };

  isCaratDisabled = false;

  private productsSubscription: Subscription | null = null;
  private productControlSubscription: Subscription | null = null;
  private filteredProductsSubscription: Subscription | null = null;

  @ViewChild('productInput') productInput!: ElementRef;
  @ViewChild('caratSelect') caratSelect!: MatSelect;
  @ViewChild('amountInput') amountInput!: ElementRef;


  constructor(private productsService: ProductsService, private snackBar: MatSnackBar) {
    this.productControl = new FormControl<string | Product>('');
    this.filteredProducts = of([]); // Initialize with empty observable

    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    this.today = new Date(formatted + 'T00:00:00');
    this.formTransaction.date = this.today.toISOString();

    //console.log(this.today.toISOString());

    // Subscribe to value changes with error handling
    this.productControlSubscription = this.productControl.valueChanges.subscribe({
      next: (value) => {
        if (!value) {
          this.selectedProduct = null;
          this.formTransaction.product = null;
          this.formTransaction.product_id = null;
          this.onDataChanged('product');
        }
      },
      error: (error) => {
        console.error('Error in product control subscription:', error);
        this.snackBar.open('Ürün seçiminde bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle changes to type and direction inputs
    if (changes['type'] && this.type) {

      this.formTransaction.type = this.type;

      if (this.context === 'Order') {
        if ((this.type === 'Product' || this.type === 'Scrap' || this.type === 'Cash' || this.type === 'Bank' || this.type === 'Money') && this.direction === 'In') {
          this.statusOptions = STATUS_OPTIONS.filter(status => status.key === 'AwaitingCustomer' || status.key === 'Received');
          if (!this.is_editing) {
            this.formTransaction.status = 'AwaitingCustomer';
          }
        }
        else if ((this.type === 'Product' || this.type === 'Scrap') && this.direction === 'Out') {
          this.statusOptions = STATUS_OPTIONS.filter(status => status.key === 'ToBeOrdered' || status.key === 'AwaitingWholesaler' || status.key === 'AwaitingCustomer' || status.key === 'Delivered');
          if (!this.is_editing) {
            this.formTransaction.status = 'ToBeOrdered';
          }
        }
        else if ((this.type === 'Cash' || this.type === 'Bank' || this.type === 'Money') && this.direction === 'Out') {
          this.statusOptions = STATUS_OPTIONS.filter(status => status.key === 'Pending' || status.key === 'Delivered');
          if (!this.is_editing) {
            this.formTransaction.status = 'Pending';
          }
        }
      }
    }

    if (changes['direction'] && this.direction) {
      this.formTransaction.direction = this.direction;

      if (this.context === 'Order') {
        if ((this.type === 'Product' || this.type === 'Scrap' || this.type === 'Cash' || this.type === 'Bank' || this.type === 'Money') && this.direction === 'In') {
          this.statusOptions = STATUS_OPTIONS.filter(status => status.key === 'AwaitingCustomer' || status.key === 'Received');
          if (!this.is_editing) {
            this.formTransaction.status = 'AwaitingCustomer';
          }
        }
        else if ((this.type === 'Product' || this.type === 'Scrap') && this.direction === 'Out') {
          this.statusOptions = STATUS_OPTIONS.filter(status => status.key === 'ToBeOrdered' || status.key === 'AwaitingWholesaler' || status.key === 'AwaitingCustomer' || status.key === 'Delivered');
          if (!this.is_editing) {
            this.formTransaction.status = 'ToBeOrdered';
          }
        }
        else if ((this.type === 'Cash' || this.type === 'Bank' || this.type === 'Money') && this.direction === 'Out') {
          this.statusOptions = STATUS_OPTIONS.filter(status => status.key === 'Pending' || status.key === 'Delivered');
          if (!this.is_editing) {
            this.formTransaction.status = 'Pending';
          }
        }
      }
    }

    if (changes['context'] && this.context) {
    }

    if (changes['agreedGoldRate'] && this.agreedGoldRate) {
      this.onDataChanged('agreed_gold_rate');
    }

    if (changes['wholesaler'] && this.wholesaler) {
      if (!this.transaction) {
        this.formTransaction.paiable_as_cash_only = !(this.wholesaler?.prefers_gold ?? true);

      }
    }

    if (changes['transaction']) {
      ;
      if (!this.transaction) {
        this.is_editing = false;
      }
      else {
        this.is_editing = true;
        this.formTransaction = { ...this.transaction };
        if (this.formTransaction.product) {
          this.selectedProduct = this.formTransaction.product;
          this.productControl.setValue(this.formTransaction.product);
        }
      }
    }


    if (changes['isAnimationComplete']) {
      if (this.isAnimationComplete && this.isOpen) {
        if (this.formTransaction.type === 'Product') {
          const input = this.productInput.nativeElement;
          input.readOnly = true;
          input.focus();
          setTimeout(() => {
            input.readOnly = false;
          }, 100);
        }
        else if (this.formTransaction.type === 'Scrap') {
          if (!this.is_editing) {
            this.formTransaction.carat = this.caratOptions[0];
          }
          this.caratSelect.focus();
        }
        else if (this.formTransaction.type === 'Cash' || this.formTransaction.type === 'Bank' || this.formTransaction.type === 'Money') {
          this.amountInput.nativeElement.focus();
        }
      }
    }
  }

  loadProducts(): void {
    this.productsSubscription = this.productsService.getProducts().subscribe({
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

        // Subscribe to filtered products changes
        this.filteredProductsSubscription = this.filteredProducts.subscribe({
          error: (error) => {
            console.error('Error in filtered products subscription:', error);
            this.snackBar.open('Ürün filtrelemede bir hata oluştu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Ürünler yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
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
    const weightInfo = product.weight_brut && product.weight_brut > 0 ? `${product.weight_brut}g` : '';
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
      this.onDataChanged('product');
    }
  }

  isTransactionValid() {
    if (this.formTransaction.type === 'Product') {
      if (!this.selectedProduct) {
        return false;
      }

      if (!(this.formTransaction.quantity && Number.isInteger(this.formTransaction.quantity) && this.formTransaction.quantity >= 0)) {
        return false;
      }

      if (this.formTransaction.agreed_price === null || isNaN(this.formTransaction.agreed_price) || this.formTransaction.agreed_price <= 0) {
        return false;
      }
    }
    else if (this.formTransaction.type === 'Scrap' || this.selectedProduct?.is_gold || this.selectedProduct?.contains_gold) {
      if (!this.formTransaction.carat) {
        return false;
      }
      if (this.formTransaction.weight_brut === null || isNaN(this.formTransaction.weight_brut) || this.formTransaction.weight_brut <= 0) {
        return false;
      }
      if (this.formTransaction.agreed_milliemes === null || isNaN(this.formTransaction.agreed_milliemes) || this.formTransaction.agreed_milliemes <= 0) {
        return false;
      }
      if (this.formTransaction.agreed_price === null || isNaN(this.formTransaction.agreed_price) || this.formTransaction.agreed_price <= 0) {
        return false;
      }
    }
    else if ((this.formTransaction.type === 'Cash' || this.formTransaction.type === 'Bank' || this.formTransaction.type === 'Money') && this.agreedGoldRate) {
      if (this.formTransaction.amount === null || isNaN(this.formTransaction.amount) || this.formTransaction.amount <= 0) {
        return false;
      }
    }

    if (this.context === 'Order') {
      if (this.formTransaction.status === null) {
        return false;
      }
      if (this.formTransaction.status === 'Delivered' || this.formTransaction.status === 'Received') {
        if (this.formTransaction.date === null) {
          return false;
        }
      }
    }

    return true;
  }

  selectQuantity(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }


  selectWeightTotalInput(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  selectMilliemesInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  selectPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  selectAmountInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  onDataChanged(field?: string) {
    switch (field) {
      case 'product':
        this.formTransaction.quantity = 1;
        this.formTransaction.carat = null;

        this.formTransaction.agreed_milliemes = 0;
        this.formTransaction.agreed_price = 0;
        this.formTransaction.agreed_weight24k = 0;

        this.formTransaction.weight_brut = 0;
        this.formTransaction.weight_brut_total = 0;
        this.formTransaction.weight24k = 0;

        this.formTransaction.paiable_as_cash_only = !this.is_editing ? !(this.wholesaler?.prefers_gold ?? true) : false;
        this.isCaratDisabled = false;

        if (this.selectedProduct && (this.selectedProduct.is_gold || this.selectedProduct.contains_gold)) {
          if (this.selectedProduct.carat) {
            this.formTransaction.carat = Number(this.selectedProduct.carat);
            this.isCaratDisabled = true;
          }
          this.formTransaction.weight_brut = this.selectedProduct.weight_brut ? this.selectedProduct.weight_brut : 0;
          this.formTransaction.weight_brut_total = this.formTransaction.weight_brut;
          this.formTransaction.weight24k = this.selectedProduct.weight24k ? this.selectedProduct.weight24k : 0;
        }
        break;
      case 'carat':
        if (this.formTransaction.carat) {
          if(this.formTransaction.weight_brut_total && this.formTransaction.weight_brut_total != 0) {
            let purity = 0;
            if(this.type == "Scrap") {
              purity = this.caratPurityMapScrap[this.formTransaction.carat as keyof typeof this.caratPurityMapScrap];
            }
            else {
              purity = this.caratPurityMapGold[this.formTransaction.carat as keyof typeof this.caratPurityMapGold];
            }
            this.formTransaction.weight24k = this.formTransaction.weight_brut_total * purity
          }
        }
        break;
      case 'weight_brut_total':
        if (this.formTransaction.weight_brut_total && this.formTransaction.weight_brut_total != 0) {
          if(this.formTransaction.carat) {
            this.formTransaction.weight_brut = this.formTransaction.weight_brut_total / (this.formTransaction.quantity || 1)
            let purity = 0;
            if(this.type == "Scrap") {
              purity = this.caratPurityMapScrap[this.formTransaction.carat as keyof typeof this.caratPurityMapScrap];
            }
            else {
              purity = this.caratPurityMapGold[this.formTransaction.carat as keyof typeof this.caratPurityMapGold];
            }
            this.formTransaction.weight24k = this.formTransaction.weight_brut_total * purity
          }
          if(this.formTransaction.agreed_milliemes && this.formTransaction.agreed_milliemes != 0) {
            this.formTransaction.agreed_weight24k = this.formTransaction.weight_brut_total * ((this.formTransaction.agreed_milliemes) / 1000);
            this.formTransaction.agreed_price = this.formTransaction.agreed_weight24k * this.agreedGoldRate;
          }
        }
        break;
      case 'quantity':
        if (this.formTransaction.quantity && this.formTransaction.quantity != 0) {
          //ceyrek gibi bir ürün seçildiyse
          if (this.selectedProduct && this.selectedProduct.weight_brut && this.selectedProduct.carat) {
            const purity = this.caratPurityMapGold[this.selectedProduct.carat as keyof typeof this.caratPurityMapGold];

            this.formTransaction.weight_brut_total = this.selectedProduct.weight_brut * this.formTransaction.quantity;
            this.formTransaction.weight24k = this.formTransaction.weight_brut_total * purity;

            if(this.formTransaction.agreed_milliemes && this.formTransaction.agreed_milliemes != 0) {
              this.formTransaction.agreed_weight24k = this.formTransaction.weight_brut_total * ((this.formTransaction.agreed_milliemes) / 1000);
              this.formTransaction.agreed_price = this.formTransaction.agreed_weight24k * this.agreedGoldRate;
            }
          }
          
          else if ((this.selectedProduct && !this.selectedProduct.weight24k) || this.type == "Scrap") {
            if (
              this.formTransaction.carat &&
              (this.formTransaction.weight_brut_total && this.formTransaction.weight_brut_total != 0)
            ) {
              let purity = 0;
              if(this.type == "Scrap") {
                purity = this.caratPurityMapScrap[this.formTransaction.carat as keyof typeof this.caratPurityMapScrap];
              }
              else {
                purity = this.caratPurityMapGold[this.formTransaction.carat as keyof typeof this.caratPurityMapGold];
              }
              this.formTransaction.weight_brut = this.formTransaction.weight_brut_total / this.formTransaction.quantity;
              this.formTransaction.weight24k = this.formTransaction.weight_brut_total * purity;

              if(this.formTransaction.agreed_milliemes && this.formTransaction.agreed_milliemes != 0) {
                this.formTransaction.agreed_weight24k = this.formTransaction.weight_brut_total * ((this.formTransaction.agreed_milliemes) / 1000);
                this.formTransaction.agreed_price = this.formTransaction.agreed_weight24k * this.agreedGoldRate;
              }
            }
          }
        }
        break;
      case 'agreed_milliemes':
        if (this.formTransaction.agreed_milliemes && this.formTransaction.agreed_milliemes != 0) {
          if (this.formTransaction.weight_brut_total && this.formTransaction.weight_brut_total != 0) {
            this.formTransaction.agreed_weight24k = this.formTransaction.weight_brut_total * ((this.formTransaction.agreed_milliemes) / 1000);
            this.formTransaction.agreed_price = this.formTransaction.agreed_weight24k * this.agreedGoldRate;
          }
        }
        break;
      case 'agreed_price':
        if (this.formTransaction.agreed_price && this.formTransaction.agreed_price != 0) {
          
          if (this.formTransaction.weight_brut_total && this.formTransaction.weight_brut_total != 0) {
            this.formTransaction.agreed_weight24k = this.formTransaction.agreed_price / this.agreedGoldRate;
            this.formTransaction.agreed_milliemes = this.formTransaction.agreed_weight24k / this.formTransaction.weight_brut_total * 1000;
          }
          if(this.selectedProduct && (!this.selectedProduct.is_gold && !this.selectedProduct.contains_gold)) {
            this.formTransaction.agreed_weight24k = this.formTransaction.agreed_price / this.agreedGoldRate;
          }
        }
        break;
      case 'amount':
        if (this.formTransaction.amount && this.formTransaction.amount != 0) {
          this.formTransaction.agreed_weight24k = this.formTransaction.amount / this.agreedGoldRate;
        }
        break;

      case 'status':
        if (this.formTransaction.status !== 'Delivered' && this.formTransaction.status !== 'Received') {
          this.formTransaction.date = this.today.toISOString();
        }
        break;
    }


    this.formTransaction.carat = Number(this.formTransaction.carat);
    if(this.formTransaction.quantity) {
      this.formTransaction.quantity = Number(this.formTransaction.quantity) || 1;
    }

    if(this.formTransaction.weight_brut) {
      this.formTransaction.weight_brut = parseFloat(this.formTransaction.weight_brut.toFixed(4));
    }
    if(this.formTransaction.weight_brut_total) {
      this.formTransaction.weight_brut_total = parseFloat(this.formTransaction.weight_brut_total.toFixed(4));
    }
    if(this.formTransaction.weight24k) {
      this.formTransaction.weight24k = parseFloat(this.formTransaction.weight24k.toFixed(4));
    }
    if(this.formTransaction.agreed_milliemes) {
      this.formTransaction.agreed_milliemes = parseFloat(this.formTransaction.agreed_milliemes.toFixed(4));
    }
    if(this.formTransaction.agreed_weight24k) {
      this.formTransaction.agreed_weight24k = parseFloat(this.formTransaction.agreed_weight24k.toFixed(4));
    }
    if(this.formTransaction.agreed_price) {
      this.formTransaction.agreed_price = parseFloat(this.formTransaction.agreed_price.toFixed(2));
    }
    if(this.formTransaction.amount) {
      this.formTransaction.amount = parseFloat(this.formTransaction.amount.toFixed(2));
    }
    
    
    
    
    /*
    this.formTransaction.weight_brut = this.formTransaction.weight_brut ? parseFloat(this.formTransaction.weight_brut.toFixed(4)) : null;
    this.formTransaction.weight_brut_total = this.formTransaction.weight_brut_total ? parseFloat(this.formTransaction.weight_brut_total.toFixed(4)) : null;
    this.formTransaction.weight24k = this.formTransaction.weight24k ? parseFloat(this.formTransaction.weight24k.toFixed(4)) : null;
    this.formTransaction.agreed_milliemes = this.formTransaction.agreed_milliemes ? parseFloat(this.formTransaction.agreed_milliemes.toFixed(4)) : null;
    this.formTransaction.agreed_weight24k = this.formTransaction.agreed_weight24k ? parseFloat(this.formTransaction.agreed_weight24k.toFixed(4)) : null;
    this.formTransaction.agreed_price = this.formTransaction.agreed_price ? parseFloat(this.formTransaction.agreed_price.toFixed(2)) : null;
    */
    /*
    console.log("carat ", this.formTransaction.carat);
    console.log("quantity", this.formTransaction.quantity);
    console.log("weight_brut ", this.formTransaction.weight_brut);
    console.log("weight_brut_total ", this.formTransaction.weight_brut_total);
    console.log("weight24k", this.formTransaction.weight24k);

    console.log("agreed_milliemes", this.formTransaction.agreed_milliemes);
    console.log("agreed_weight24k", this.formTransaction.agreed_weight24k);
    console.log("agreed_price", this.formTransaction.agreed_price);
    */
  }


  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const transactionToSubmit = {
      ...this.formTransaction,
      id: this.formTransaction.id || null,
      paiable_as_cash_only: this.formTransaction.paiable_as_cash_only ?? !(this.wholesaler?.prefers_gold ?? true),
      product: this.formTransaction.product || null,
      carat: this.formTransaction.carat || null,
      status: this.formTransaction.status || null
    };
    this.transactionSubmit.emit(transactionToSubmit);
    this.resetForm();
  }


  //is also called from the parent components onDrawerClose function as transactionComponent.resetForm()
  resetForm() {


    this.selectedProduct = null;
    this.productControl.setValue('');
    this.isCaratDisabled = false;
    this.selectedProduct = null;
    this.isCaratDisabled = false;
    this.formTransaction = {
      ...this.formTransaction,
      date: this.today.toISOString(),
      id: null,
      product: null,
      agreed_milliemes: 0,
      agreed_price: 0,
      agreed_weight24k: 0,
      weight_brut: 0,
      weight_brut_total: 0,
      carat: null,
      amount: 0,
      quantity: 1,
      weight24k: 0,
      status: null
    };

    if (this.context === 'Order') {
      if ((this.type === 'Product' || this.type === 'Scrap' || this.type === 'Cash' || this.type === 'Bank' || this.type === 'Money') && this.direction === 'In') {
        this.formTransaction.status = 'AwaitingCustomer';
      }
      else if ((this.type === 'Product' || this.type === 'Scrap') && this.direction === 'Out') {
        this.formTransaction.status = 'ToBeOrdered';
      }
      else if ((this.type === 'Cash' || this.type === 'Bank' || this.type === 'Money') && this.direction === 'Out') {
        this.formTransaction.status = 'Pending';
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.productControlSubscription) {
      this.productControlSubscription.unsubscribe();
    }
    if (this.filteredProductsSubscription) {
      this.filteredProductsSubscription.unsubscribe();
    }
  }
}