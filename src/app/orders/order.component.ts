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
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../interfaces/product.interface';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { TransactionComponent } from '../transactions/transaction.component';
import { AuthService } from '../services/auth.service';
import { ProductsService } from '../services/products.service';
import { Order } from '../interfaces/order.interface';
import { OrderService } from '../services/order.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthLabel: 'MMM',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
        DragDropModule,
        DrawerComponent,
        TransactionComponent,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule
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
  
  order: Order = {
    id: undefined,
    description: '',
    client_name: '',
    client_phone: '',
    date_planned: new Date(),
    user_id: 0,
    transactions: [],
    total24kProductOut: 0,
    total24kOut: 0,
    totalCashIn: 0,
    totalBankIn: 0,
    totalPaymentIn: 0,
    total_order_amount: 0,
    remaining_amount: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);

    // Set current user ID and date
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.order.user_id = currentUser.id;
    }
    this.order.date_planned = new Date();

    this.loadProducts();

    // Handle route parameters
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.isEditing = true;
        this.orderService.getOrder(Number(orderId)).subscribe({
          next: (order) => {
            this.order = order;
            
            // Ensure all product transactions have a status
            this.order.transactions = this.order.transactions.map(t => {
              if (t.type === 'Product' && !t.status) {
                return { ...t, status: 'ToBeOrdered' };
              }
              return t;
            });
            
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
          id: undefined,
          description: '',
          client_name: '',
          client_phone: '',
          date_planned: new Date(),
          user_id: currentUser?.id || 0,
          transactions: [],
          total24kProductOut: 0,
          total24kOut: 0,
          totalCashIn: 0,
          totalBankIn: 0,
          totalPaymentIn: 0,
          total_order_amount: 0,
          remaining_amount: 0,
        };
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


  openTransactionDrawer(type: 'Product' | 'Cash' | 'Bank' | 'Money', direction: 'In' | 'Out') {
    this.transactionType = type;
    this.transactionDirection = direction;
    this.isDrawerOpen = true;
  }

  onDrawerClose() {
    this.isDrawerOpen = false;
    this.editingTransactionIndex = null;
    if (this.transactionComponent) {
      this.transactionComponent.resetForm();
    }
  }

  onDrawerAnimationComplete(isOpen: boolean) {
    this.isDrawerAnimationComplete = isOpen;
  }

  onTransactionSubmit(transaction: Transaction) {
    if (this.editingTransactionIndex !== null) {
      // Update existing transaction but preserve the status if it exists
      const existingTransaction = this.order.transactions[this.editingTransactionIndex];
      if (transaction.type === 'Product') {
        // Keep the existing status if it exists, otherwise set to default
        transaction.status = existingTransaction.status || 'ToBeOrdered';
      }
      this.order.transactions = this.order.transactions.map((t, i) => 
        i === this.editingTransactionIndex ? transaction : t
      );
      this.editingTransactionIndex = null;
    } else {
      // Add new transaction
      if(transaction.type === 'Product') {
        // Ensure new product transactions have a status
        transaction.status = transaction.status || 'ToBeOrdered';
      }
      this.order.transactions = [...this.order.transactions, transaction];
    }
    
    // Update row_index for all transactions to match their current position
    this.order.transactions = this.order.transactions.map((t, index) => ({
      ...t,
      row_index: index
    }));

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
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  onSubmit() {
    if (this.order.transactions.length === 0) {
      return;
    }

    // Create a deep clone of the order and its transactions
    const orderToSubmit = {
      ...this.order,
      transactions: this.order.transactions.map(transaction => ({...transaction}))
    };

    // Ensure all product transactions have a status
    orderToSubmit.transactions = orderToSubmit.transactions.map(transaction => {
      if (transaction.type === 'Product' && !transaction.status) {
        transaction.status = 'ToBeOrdered';
      }
      return transaction;
    });

    orderToSubmit.transactions.forEach(transaction => {
      if(transaction.type === 'Product') {
        delete transaction.amount;
        if (transaction.type === 'Product') {
          transaction.product_id = transaction.product?.id;
          delete transaction.product;
        }
      }
      if(transaction.type === 'Cash' || transaction.type === 'Bank') {
        delete transaction.product_id;
        delete transaction.weight_brut;
        delete transaction.carat;
        delete transaction.quantity;
        delete transaction.weight24k;
        delete transaction.product;
      }
    });

    let total24kProductOut = 0;
    let total24kOut = 0;
    let totalCashIn = 0;
    let totalBankIn = 0;

    orderToSubmit.transactions.forEach(transaction => {
      if(transaction.type === 'Product') {
        if(transaction.direction === 'Out') {
          total24kProductOut += transaction.weight24k || 0;
          total24kOut += transaction.weight24k || 0;
        }
      }
      if(transaction.type === 'Cash') {
        if(transaction.direction === 'In') {
          totalCashIn += transaction.amount || 0;
        }
      }
      if(transaction.type === 'Bank') {
        if(transaction.direction === 'In') {
          totalBankIn += transaction.amount || 0;
        }
      }
    });

    try {
      orderToSubmit.total24kProductOut = parseFloat(total24kProductOut.toFixed(4));
      orderToSubmit.total24kOut = parseFloat(total24kOut.toFixed(4));
      orderToSubmit.totalCashIn = parseFloat(totalCashIn.toFixed(2));
      orderToSubmit.totalBankIn = parseFloat(totalBankIn.toFixed(2));
      orderToSubmit.totalPaymentIn = parseFloat((totalCashIn + totalBankIn).toFixed(2));
      orderToSubmit.remaining_amount = parseFloat((orderToSubmit.total_order_amount - orderToSubmit.totalPaymentIn).toFixed(2));
    } catch (error) {
      this.snackBar.open('Toplam değerler hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      // Provide fallback values
      orderToSubmit.total24kProductOut = total24kProductOut;
      orderToSubmit.total24kOut = total24kOut;
      orderToSubmit.totalCashIn = totalCashIn;
      orderToSubmit.totalBankIn = totalBankIn;
      orderToSubmit.totalPaymentIn = totalCashIn + totalBankIn;
      orderToSubmit.remaining_amount = orderToSubmit.total_order_amount - orderToSubmit.totalPaymentIn;
    }

    if (this.isEditing && this.order.id) {
      this.orderService.updateOrder(this.order.id, orderToSubmit).subscribe({
        next: () => {
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
      this.orderService.createOrder(orderToSubmit).subscribe({
        next: () => {
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

  drop(event: CdkDragDrop<Transaction[]>) {
    const transactions = [...this.order.transactions];
    const movedItem = transactions[event.previousIndex];
    transactions.splice(event.previousIndex, 1);
    transactions.splice(event.currentIndex, 0, movedItem);
    
    // Update row_index for all transactions to match their current position
    this.order.transactions = transactions.map((t, index) => ({
      ...t,
      row_index: index
    }));
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  calculateTotal24kProductOut(): number {
    try {
      const total = this.order.transactions
        .filter(t => t.type === 'Product' && t.direction === 'Out')
        .reduce((sum, t) => sum + (t.weight24k || 0), 0);
      return parseFloat(total.toFixed(4));
    } catch (error) {
      this.snackBar.open('24k ürün çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return 0;
    }
  }

  calculateTotal24kOut(): number {
    return this.calculateTotal24kProductOut();
  }

  calculateTotalCashIn(): string {
    try {
      const total = this.order.transactions
        .filter(t => t.type === 'Cash' && t.direction === 'In')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return total.toFixed(2);
    } catch (error) {
      this.snackBar.open('Nakit girişi hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return "0.00";
    }
  }

  calculateTotalBankIn(): string {
    try {
      const total = this.order.transactions
        .filter(t => t.type === 'Bank' && t.direction === 'In')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return total.toFixed(2);
    } catch (error) {
      this.snackBar.open('Banka girişi hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return "0.00";
    }
  }

  calculateTotalPaymentIn(): string {
    try {
      const cashTotal = parseFloat(this.calculateTotalCashIn());
      const bankTotal = parseFloat(this.calculateTotalBankIn());
      return (cashTotal + bankTotal).toFixed(2);
    } catch (error) {
      this.snackBar.open('Toplam ödeme hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return "0.00";
    }
  }

  calculateRemainingAmount(): string {
    try {
      const paymentTotal = parseFloat(this.calculateTotalPaymentIn());
      return (this.order.total_order_amount - paymentTotal).toFixed(2);
    } catch (error) {
      this.snackBar.open('Kalan miktar hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return "0.00";
    }
  }

  isOrderValid(): boolean {

    let isProductInTransactions = this.order.transactions.some(t => t.type === 'Product');


    return this.order.transactions.length > 0 
    && isProductInTransactions
    && this.order.total_order_amount > 0 
    && this.order.client_name.trim() !== ''
    && this.order.client_phone.trim() !== ''
    && this.order.date_planned !== null;
  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }
} 