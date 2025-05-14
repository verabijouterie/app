import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../interfaces/transaction.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../interfaces/product.interface';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { TransactionComponent } from '../transactions/transaction.component';
import { ProductsService } from '../services/products.service';
import { Order } from '../interfaces/order.interface';
import { OrderService } from '../services/order.service';
import { GoldRateService } from '../services/gold-rate.services';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';



@Component({
  selector: 'app-order',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    DrawerComponent,
    TransactionComponent,
    MatDatepickerModule,
    MatSnackBarModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  standalone: true,
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  @ViewChild(TransactionComponent) transactionComponent!: TransactionComponent;
  products: Product[] = [];
  editingTransactionIndex: number | null = null;
  isEditing: boolean = false;
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  isDrawerAnimationComplete = false;
  transactionType?: 'Product' | 'Scrap' | 'Cash' | 'Bank' | 'Money';
  transactionDirection?: 'In' | 'Out';
  defaultGoldRate = 0;

  isATransactionGold = false;
  isATransactionMoney = false;

  today: Date = new Date();

  order: Order = {
    id: null,
    date: this.today.toISOString(),
    description: '',
    client_name: '',
    client_phone: '',
    order_amount: 0,
    agreedGoldRate: 0,
    transactions: [],

    total24kProductIn: 0,
    total24kProductOut: 0,
    total24kScrapIn: 0,
    total24kScrapOut: 0,
    total24kIn: 0,
    total24kOut: 0,
    total24k: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    totalBankIn: 0,
    totalBankOut: 0,
    totalMoneyIn: 0,
    totalMoneyOut: 0,
    totalMoney: 0,
    status: null,
  };

  initialOrder: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private goldRateService: GoldRateService
  ) { }

  ngOnInit() {
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);

    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    this.today = new Date(formatted + 'T00:00:00');

    this.loadProducts();

    // Handle route parameters
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.isEditing = true;
        this.orderService.getOrder(Number(orderId)).subscribe({
          next: (order) => {
            this.order = order;
            this.initialOrder = { ...order };

            this.isATransactionGold = this.order.transactions.some(transaction => transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold));
            this.isATransactionMoney = this.order.transactions.some(transaction => transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money');

          },
          error: (error) => {
            this.snackBar.open('Sipariş yüklenirken bir hata oluştu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            // Redirect to orders list if order not found
            this.router.navigate(['/orders']);
          }
        });
      } else {
        this.isEditing = false;
        // Reset order for new creation


        
        this.order = {
          id: null,
          date: this.today.toISOString(),
          description: '',
          client_name: '',
          client_phone: '',
          order_amount: 0,
          agreedGoldRate: 0,
          transactions: [],
      
          total24kProductIn: 0,
          total24kProductOut: 0,
          total24kScrapIn: 0,
          total24kScrapOut: 0,
          total24kIn: 0,
          total24kOut: 0,
          total24k: 0,
          totalCashIn: 0,
          totalCashOut: 0,
          totalBankIn: 0,
          totalBankOut: 0,
          totalMoneyIn: 0,
          totalMoneyOut: 0,
          totalMoney: 0,
          status: null,
        };
        this.loadDefaultGoldRate();
      }
    });
  }

  loadProducts() {
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        this.snackBar.open('Ürünler yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadDefaultGoldRate() {
    console.log("Loading Default Gold Rate");
    this.goldRateService.getGoldRates().subscribe({
      next: (goldRate) => {
        if (Array.isArray(goldRate)) {
          this.defaultGoldRate = goldRate[0]?.rate || 0;
        } else {
          this.defaultGoldRate = goldRate?.rate || 0;
        }
        if (!this.isEditing) {
          this.order.agreedGoldRate = this.defaultGoldRate;
        }
      }
    });
  }

  onGoldRateChange() {
    this.order.transactions.forEach(transaction => {
      this.recalculateTransaction(transaction, this.order.agreedGoldRate);
    });

    this.recalculateTotals();
  }

  onDateChange() {
    console.log("ToDO: OnDateChange");
    /*
    this.order.transactions.forEach(transaction => {
      transaction.date = this.order.date;
    });
    */
  }

  recalculateTransaction(transaction: Transaction, goldRate: number) {
    if (transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money') {
      transaction.agreed_weight24k = parseFloat(((transaction.amount || 0) / goldRate).toFixed(4));
    }
    if (transaction.type === 'Product' && !Boolean(transaction.product?.is_gold)) {
      transaction.agreed_weight24k = parseFloat(((transaction.agreed_price || 0) / goldRate).toFixed(4));
    }
    if ((transaction.type === 'Product' && Boolean(transaction.product?.is_gold)) || transaction.type === 'Scrap') {
      transaction.agreed_weight24k = parseFloat(((transaction.weight_brut || 0) * ((transaction.agreed_milliemes || 0) / 1000) * (transaction.quantity || 1)).toFixed(4));
      transaction.agreed_price = parseFloat(((goldRate) * (transaction.agreed_weight24k || 0)).toFixed(2));
    }
  }

  openTransactionDrawer(type: 'Product' | 'Scrap' | 'Cash' | 'Bank' | 'Money', direction: 'In' | 'Out') {
    this.transactionType = type;
    this.transactionDirection = direction;
    this.isDrawerOpen = true;
  }

  onDrawerClose() {
    // Only reset after animation completes
    if (this.isDrawerOpen) {
      this.isDrawerOpen = false;
      this.skipDrawerAnimation = false;
      this.editingTransactionIndex = null;
      if (this.transactionComponent) {
        this.transactionComponent.resetForm();
      }
    }
  }

  onDrawerAnimationComplete(isOpen: boolean) {
    this.isDrawerAnimationComplete = isOpen;
  }

  onTransactionSubmit(transaction: Transaction) {
    transaction.date = this.order.date;

    if (this.editingTransactionIndex !== null) {
      this.order.transactions = this.order.transactions.map((t, i) =>
        i === this.editingTransactionIndex ? transaction : t
      );
      this.editingTransactionIndex = null;
    } else {
      // Add new transaction
      this.order.transactions = [...this.order.transactions, transaction];
    }

    this.isATransactionGold = this.order.transactions.some(transaction => transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold));
    this.isATransactionMoney = this.order.transactions.some(transaction => transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money');

    this.recalculateTotals();

    console.log("OnTransactionSubmit:", this.order.transactions);
    this.isDrawerOpen = false;
  }


  editTransaction(index: number) {
    this.editingTransactionIndex = index;
    const transaction = this.order.transactions[index];
    this.transactionType = transaction.type;
    this.transactionDirection = transaction.direction;
    this.isDrawerOpen = true;
  }

  deleteTransaction(index: number) {
    this.order.transactions = this.order.transactions.filter((_, i) => i !== index);
    this.recalculateTotals();
  }


  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  onSubmit() {
    // If we're editing, check if there are any changes
    if (this.isEditing && this.initialOrder) {
      const hasChanges = this.hasOrderChanged(this.initialOrder, this.order);

      if (!hasChanges) {

        this.snackBar.open('Değişiklik yapılmadı', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['info-snackbar']
        });

        //this.router.navigate(['/scenarios']);
        return;
      }
    }
    if (this.isEditing && this.order.id) {
      this.orderService.updateOrder(this.order.id, this.order).subscribe({
        next: (response) => {

          this.initialOrder = { ...(response as any).order };
          this.order = (response as any).order;
          this.snackBar.open('Sipariş güncellendi', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['info-snackbar']
          });

          //this.router.navigate(['/supplies']);
        },
        error: (error) => {
          this.snackBar.open('Sipariş güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.orderService.createOrder(this.order).subscribe({
        next: (response) => {
          this.initialOrder = { ...(response as any).order };
          this.order = (response as any).order;
          this.isEditing = true;
          this.snackBar.open('Sipariş oluşturuldu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['info-snackbar']
          });
          //this.router.navigate(['/scenarios']);
        },
        error: (error) => {
          this.snackBar.open('Sipariş oluşturulurken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private hasOrderChanged(initial: Order, current: Order): boolean {
    // Compare basic properties
    if (initial.description !== current.description ||
      initial.agreedGoldRate !== current.agreedGoldRate ||
      initial.client_name !== current.client_name ||
      initial.client_phone !== current.client_phone ||
      initial.order_amount !== current.order_amount ||
      initial.date !== current.date) {
      return true;
    }

    // Compare transactions
    if (initial.transactions.length !== current.transactions.length) {
      return true;
    }

    // Deep compare transactions
    for (let i = 0; i < current.transactions.length; i++) {
      const currentTransaction = current.transactions[i];
      const initialTransaction = initial.transactions[i];

      if (!initialTransaction ||
        currentTransaction.type !== initialTransaction.type ||
        currentTransaction.direction !== initialTransaction.direction ||
        currentTransaction.product_id !== initialTransaction.product_id ||
        currentTransaction.quantity !== initialTransaction.quantity ||
        currentTransaction.weight_brut !== initialTransaction.weight_brut ||
        currentTransaction.carat !== initialTransaction.carat ||
        currentTransaction.agreed_milliemes !== initialTransaction.agreed_milliemes ||
        currentTransaction.agreed_weight24k !== initialTransaction.agreed_weight24k ||
        currentTransaction.agreed_price !== initialTransaction.agreed_price ||
        currentTransaction.paiable_as_cash_only !== initialTransaction.paiable_as_cash_only ||
        currentTransaction.amount !== initialTransaction.amount ||
        currentTransaction.status !== initialTransaction.status) {
        return true;
      }
    }

    return false;
  }

  recalculateTotals() {

    let total24kProductIn = 0;
    let total24kProductOut = 0;
    let total24kScrapIn = 0;
    let total24kScrapOut = 0;
    let total24kIn = 0;
    let total24kOut = 0;
    let total24k = 0;
    let totalCashIn = 0;
    let totalCashOut = 0;
    let totalBankIn = 0;
    let totalBankOut = 0;
    let totalMoneyIn = 0;
    let totalMoneyOut = 0;
    let totalMoney = 0;

    this.order.transactions.forEach(transaction => {
      // Calculate as gold
      if (transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold)) {
        if (transaction.direction === 'In') {
          total24kProductIn += Number(transaction.agreed_weight24k || 0);
          total24kIn += Number(transaction.agreed_weight24k || 0);
          total24k += Number(transaction.agreed_price || 0);
        } else {
          total24kProductOut += Number(transaction.agreed_weight24k || 0);
          total24kOut += Number(transaction.agreed_weight24k || 0);
          total24k -= Number(transaction.agreed_price || 0);
        }
      }
      if (transaction.type === 'Scrap') {
        if (transaction.direction === 'In') {
          total24kScrapIn += Number(transaction.agreed_weight24k || 0);
          total24kIn += Number(transaction.agreed_weight24k || 0);
          total24k += Number(transaction.agreed_price || 0);
        } else {
          total24kScrapOut += Number(transaction.agreed_weight24k || 0);
          total24kOut -= Number(transaction.agreed_weight24k || 0);
          total24k -= Number(transaction.agreed_price || 0);
        }
      }
      if (transaction.type === 'Cash') {
        if (transaction.direction === 'In') {
          totalCashIn += Number(transaction.amount || 0);
          totalMoneyIn += Number(transaction.amount || 0);
          totalMoney += Number(transaction.amount || 0);
        } else {
          totalCashOut += Number(transaction.amount || 0);
          totalMoneyOut += Number(transaction.amount || 0);
          totalMoney -= Number(transaction.amount || 0);
        }
      }
      if (transaction.type === 'Bank') {
        if (transaction.direction === 'In') {
          totalBankIn += Number(transaction.amount || 0);
          totalMoneyIn += Number(transaction.amount || 0);
          totalMoney += Number(transaction.amount || 0);
        } else {
          totalBankOut += Number(transaction.amount || 0);
          totalMoneyOut += Number(transaction.amount || 0);
          totalMoney -= Number(transaction.amount || 0);
        }
      }

    });


    this.order.total24kProductIn = parseFloat(total24kProductIn.toFixed(4));
    this.order.total24kProductOut = parseFloat(total24kProductOut.toFixed(4));
    this.order.total24kScrapIn = parseFloat(total24kScrapIn.toFixed(4));
    this.order.total24kScrapOut = parseFloat(total24kScrapOut.toFixed(4));
    this.order.total24kIn = parseFloat(total24kIn.toFixed(4));
    this.order.total24kOut = parseFloat(total24kOut.toFixed(4));
    this.order.total24k = parseFloat(total24k.toFixed(4));

    this.order.totalCashIn = parseFloat(totalCashIn.toFixed(2));
    this.order.totalCashOut = parseFloat(totalCashOut.toFixed(2));
    this.order.totalBankIn = parseFloat(totalBankIn.toFixed(2));
    this.order.totalBankOut = parseFloat(totalBankOut.toFixed(2));
    this.order.totalMoneyIn = parseFloat(totalMoneyIn.toFixed(2));
    this.order.totalMoneyOut = parseFloat(totalMoneyOut.toFixed(2));
    this.order.totalMoney = parseFloat(totalMoney.toFixed(2));

    console.log("Recalculated Totals:", this.order);


  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }
  

  isOrderValid(): boolean {
    let isProductInTransactions = this.order.transactions.some(t => t.type === 'Product');
    console.log("ToDo: isOrderValid");
    /*
    return this.order.transactions.length > 0
      && isProductInTransactions
      && this.order.order_amount > 0
      && this.order.client_name.trim() !== ''
      && this.order.client_phone.trim() !== ''
      && this.order.date !== null;
      */
     return true;
  }

  isNaN(value: any): boolean {
    return Number.isNaN(value);
  }


} 