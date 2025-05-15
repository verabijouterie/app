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
import { STATUS_OPTIONS } from '../config/constants';



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
  statusOptions = STATUS_OPTIONS;

  isATransactionGold = false;
  isATransactionMoney = false;

  today: Date = new Date();



  order: Order = {
    id: null,
    date: this.today.toISOString(),
    description: '',
    client_name: '',
    client_phone: '',
    agreedGoldRate: 0,
    transactions: [],

    totalProductInAsMoney :0,
    totalProductInAsMoneyPending :0,
    totalProductOutAsMoney :0,
    totalProductOutAsMoneyPending :0,
    totalScrapInAsMoney :0,
    totalScrapInAsMoneyPending :0,
    totalScrapOutAsMoney :0,
    totalScrapOutAsMoneyPending :0,
    
    totalCashIn :0,
    totalCashInPending :0,
    totalCashOut :0,
    totalCashOutPending :0,
    totalBankIn :0,
    totalBankInPending :0,
    totalBankOut :0,
    totalBankOutPending :0,
    
    total24kProductIn :0,
    total24kProductInPending :0,
    total24kProductOut :0,
    total24kProductOutPending :0,
    total24kScrapIn :0,
    total24kScrapInPending :0,
    total24kScrapOut :0,
    total24kScrapOutPending :0,
    total24kIn :0,
    total24kInPending :0,
    total24kOut :0,
    total24kOutPending :0,
    total24k :0,
    total24kPending :0,
    
    
    totalMoneyIn :0,
    totalMoneyInPending :0,
    totalMoneyOut :0,
    totalMoneyOutPending :0,
    totalMoney :0,
    totalMoneyPending :0,

    grandTotalAsMoney: 0,
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
          agreedGoldRate: 0,
          transactions: [],

          totalProductInAsMoney :0,
          totalProductInAsMoneyPending :0,
          totalProductOutAsMoney :0,
          totalProductOutAsMoneyPending :0,
          totalScrapInAsMoney :0,
          totalScrapInAsMoneyPending :0,
          totalScrapOutAsMoney :0,
          totalScrapOutAsMoneyPending :0,
          
          totalCashIn :0,
          totalCashInPending :0,
          totalCashOut :0,
          totalCashOutPending :0,
          totalBankIn :0,
          totalBankInPending :0,
          totalBankOut :0,
          totalBankOutPending :0,
          
          total24kProductIn :0,
          total24kProductInPending :0,
          total24kProductOut :0,
          total24kProductOutPending :0,
          total24kScrapIn :0,
          total24kScrapInPending :0,
          total24kScrapOut :0,
          total24kScrapOutPending :0,
          total24kIn :0,
          total24kInPending :0,
          total24kOut :0,
          total24kOutPending :0,
          total24k :0,
          total24kPending :0,
          
          
          totalMoneyIn :0,
          totalMoneyInPending :0,
          totalMoneyOut :0,
          totalMoneyOutPending :0,
          totalMoney :0,
          totalMoneyPending :0,
      
          grandTotalAsMoney: 0,

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
    this.calculateStatus();
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
    this.calculateStatus();
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

        this.router.navigate(['/orders']);
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

          this.router.navigate(['/orders']);
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
          this.router.navigate(['/orders']);
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
      initial.date !== current.date || 
      initial.status !== current.status
      
    ) {
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
        currentTransaction.date !== initialTransaction.date ||
        currentTransaction.type !== initialTransaction.type ||
        currentTransaction.direction !== initialTransaction.direction ||
        currentTransaction.product_id !== initialTransaction.product_id ||

        currentTransaction.weight_brut !== initialTransaction.weight_brut ||
        currentTransaction.weight_brut_total !== initialTransaction.weight_brut_total ||
        currentTransaction.carat !== initialTransaction.carat ||
        currentTransaction.amount !== initialTransaction.amount ||
        currentTransaction.quantity !== initialTransaction.quantity ||
        currentTransaction.weight24k !== initialTransaction.weight24k ||
        currentTransaction.agreed_milliemes !== initialTransaction.agreed_milliemes ||
        currentTransaction.agreed_weight24k !== initialTransaction.agreed_weight24k ||
        currentTransaction.agreed_price !== initialTransaction.agreed_price ||
        currentTransaction.paiable_as_cash_only !== initialTransaction.paiable_as_cash_only ||
        currentTransaction.status !== initialTransaction.status) {
        return true;
      }
    }

    return false;
  }


  //Depends from grandTotalAsMoney. Run it after recalculateTotals
  calculateStatus() {

    let minPriority = 9999;
    this.order.transactions.forEach(transaction => {
      const statusOption = this.statusOptions.find(s => s.key === transaction.status);
      if (statusOption) {
        if (statusOption.priority < minPriority) {
          minPriority = statusOption.priority;
        }
      }
    });


    let status = this.statusOptions.find(s => s.priority === minPriority)?.key || null;

    if(status === 'Delivered' || status === 'Received') {
      status = 'Completed';
    }

    this.order.status = status;
  }

  recalculateTotals() {

    this.order.total24kIn =  0;
    this.order.total24kInPending = 0;
    this.order.total24kOut = 0;
    this.order.total24kOutPending = 0;
    this.order.total24k =  0;
    this.order.total24kPending = 0;

    this.order.total24kProductIn = 0;
    this.order.total24kProductInPending = 0;
    this.order.total24kProductOut = 0;
    this.order.total24kProductOutPending = 0;
    this.order.total24kScrapIn = 0;
    this.order.total24kScrapInPending = 0;
    this.order.total24kScrapOut = 0;
    this.order.total24kScrapOutPending = 0;

    this.order.totalProductInAsMoney = 0;
    this.order.totalProductInAsMoneyPending = 0;
    this.order.totalProductOutAsMoney = 0;
    this.order.totalProductOutAsMoneyPending = 0;
    this.order.totalScrapInAsMoney = 0;
    this.order.totalScrapInAsMoneyPending = 0;
    this.order.totalScrapOutAsMoney = 0;
    this.order.totalScrapOutAsMoneyPending = 0;

    this.order.totalCashIn = 0;
    this.order.totalCashInPending = 0;
    this.order.totalCashOut = 0;
    this.order.totalCashOutPending = 0;
    this.order.totalBankIn = 0;
    this.order.totalBankInPending = 0;
    this.order.totalBankOut = 0;
    this.order.totalBankOutPending = 0;

    this.order.totalMoneyIn = 0;
    this.order.totalMoneyInPending = 0;
    this.order.totalMoneyOut = 0;
    this.order.totalMoneyOutPending = 0;
    this.order.totalMoney = 0;
    this.order.totalMoneyPending = 0;


    this.order.grandTotalAsMoney = 0;


    this.order.transactions.forEach(transaction => {

      if (transaction.status === 'Delivered' || transaction.status === 'Received') {
        if (transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold)) {
          if (transaction.direction === 'In') {
            this.order.total24kProductIn = parseFloat((this.order.total24kProductIn + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kIn = parseFloat((this.order.total24kIn + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24k = parseFloat((this.order.total24k + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalProductInAsMoney = parseFloat((this.order.totalProductInAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
          } else {
            this.order.total24kProductOut = parseFloat((this.order.total24kProductOut + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kOut = parseFloat((this.order.total24kOut + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24k = parseFloat((this.order.total24k - Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalProductOutAsMoney = parseFloat((this.order.totalProductOutAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.agreed_price || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Product' && (!transaction.product?.is_gold && !transaction.product?.contains_gold)) {
          if (transaction.direction === 'In') {
            this.order.totalProductInAsMoney = parseFloat((this.order.totalProductInAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
          } else {
            this.order.totalProductOutAsMoney = parseFloat((this.order.totalProductOutAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.agreed_price || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Scrap') {
          if (transaction.direction === 'In') {
            this.order.total24kScrapIn = parseFloat((this.order.total24kScrapIn + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kIn = parseFloat((this.order.total24kIn + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24k = parseFloat((this.order.total24k + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalScrapInAsMoney = parseFloat((this.order.totalScrapInAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
          } else {
            this.order.total24kScrapOut = parseFloat((this.order.total24kScrapOut + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kOut = parseFloat((this.order.total24kOut + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24k = parseFloat((this.order.total24k - Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalScrapOutAsMoney = parseFloat((this.order.totalScrapOutAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.agreed_price || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Cash') {
          if (transaction.direction === 'In') {
            this.order.totalCashIn = parseFloat((this.order.totalCashIn + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyIn = parseFloat((this.order.totalMoneyIn + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoney = parseFloat((this.order.totalMoney + Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.amount || 0)).toFixed(2));
          } else {
            this.order.totalCashOut = parseFloat((this.order.totalCashOut + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyOut = parseFloat((this.order.totalMoneyOut + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoney = parseFloat((this.order.totalMoney - Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.amount || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Bank') {
          if (transaction.direction === 'In') {
            this.order.totalBankIn = parseFloat((this.order.totalBankIn + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyIn = parseFloat((this.order.totalMoneyIn + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoney = parseFloat((this.order.totalMoney + Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.amount || 0)).toFixed(2));
          } else {
            this.order.totalBankOut = parseFloat((this.order.totalBankOut + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyOut = parseFloat((this.order.totalMoneyOut + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoney = parseFloat((this.order.totalMoney - Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.amount || 0)).toFixed(2));
          }
        }
      }
      else {
        if (transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold)) {
          if (transaction.direction === 'In') {
            this.order.total24kProductInPending = parseFloat((this.order.total24kProductInPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kInPending = parseFloat((this.order.total24kInPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kPending = parseFloat((this.order.total24kPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalProductInAsMoneyPending = parseFloat((this.order.totalProductInAsMoneyPending + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
          } else {
            this.order.total24kProductOutPending = parseFloat((this.order.total24kProductOutPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kOutPending = parseFloat((this.order.total24kOutPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kPending = parseFloat((this.order.total24kPending - Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalProductOutAsMoneyPending = parseFloat((this.order.totalProductOutAsMoneyPending + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.agreed_price || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Product' && (!transaction.product?.is_gold && !transaction.product?.contains_gold)) {
          if (transaction.direction === 'In') {
            this.order.totalProductInAsMoneyPending = parseFloat((this.order.totalProductInAsMoneyPending + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
          } else {
            this.order.totalProductOutAsMoneyPending = parseFloat((this.order.totalProductOutAsMoneyPending + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.agreed_price || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Scrap') {
          if (transaction.direction === 'In') {
            this.order.total24kScrapInPending = parseFloat((this.order.total24kScrapInPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kInPending = parseFloat((this.order.total24kInPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kPending = parseFloat((this.order.total24kPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalScrapInAsMoneyPending = parseFloat((this.order.totalScrapInAsMoneyPending + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.agreed_price || 0)).toFixed(2));
          } else {
            this.order.total24kScrapOutPending = parseFloat((this.order.total24kScrapOutPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kOutPending = parseFloat((this.order.total24kOutPending + Number(transaction.weight24k || 0)).toFixed(2));
            this.order.total24kPending = parseFloat((this.order.total24kPending - Number(transaction.weight24k || 0)).toFixed(2));
            this.order.totalScrapOutAsMoneyPending = parseFloat((this.order.totalScrapOutAsMoneyPending + Number(transaction.agreed_price || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.agreed_price || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Cash') {
          if (transaction.direction === 'In') {
            this.order.totalCashInPending = parseFloat((this.order.totalCashInPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyInPending = parseFloat((this.order.totalMoneyInPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyPending = parseFloat((this.order.totalMoneyPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.amount || 0)).toFixed(2));
          } else {
            this.order.totalCashOutPending = parseFloat((this.order.totalCashOutPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyOutPending = parseFloat((this.order.totalMoneyOutPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyPending = parseFloat((this.order.totalMoneyPending - Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.amount || 0)).toFixed(2));
          }
        }
        if (transaction.type === 'Bank') {
          if (transaction.direction === 'In') {
            this.order.totalBankInPending = parseFloat((this.order.totalBankInPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyInPending = parseFloat((this.order.totalMoneyInPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyPending = parseFloat((this.order.totalMoneyPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney + Number(transaction.amount || 0)).toFixed(2));
          } else {
            this.order.totalBankOutPending = parseFloat((this.order.totalBankOutPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyOutPending = parseFloat((this.order.totalMoneyOutPending + Number(transaction.amount || 0)).toFixed(2));
            this.order.totalMoneyPending = parseFloat((this.order.totalMoneyPending - Number(transaction.amount || 0)).toFixed(2));
            this.order.grandTotalAsMoney = parseFloat((this.order.grandTotalAsMoney - Number(transaction.amount || 0)).toFixed(2));
          }
        }
      }

    });

  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }


  isOrderValid(): boolean {

    if(this.order.transactions.length === 0) {
      return false;
    }

    if(this.order.client_name.trim() === '') {
      return false;
    }

    if(this.order.client_phone.trim() === '') {
      return false;
    }

    if(this.order.date === null ) {
      return false;
    }

    if(this.order.agreedGoldRate === null || this.order.agreedGoldRate < 0) {
      return false;
    }

    return true;

  }

  isNaN(value: any): boolean {
    return Number.isNaN(value);
  }

  getStatusValue(status: string | null): string {
    if (!status) return '';
    return this.statusOptions.find(s => s.key === status)?.value || '';
  }

} 