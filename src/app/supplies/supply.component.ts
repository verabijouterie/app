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
import { SupplyService } from '../services/supply.service';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { TransactionComponent } from '../transactions/transaction.component';
import { AuthService } from '../services/auth.service';
import { ProductsService } from '../services/products.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Supply } from '../interfaces/supply.interface';
import { WholesalerService } from '../services/wholesaler.service';
import { Wholesaler } from '../interfaces/wholesaler.interface';
import { GoldRateService } from '../services/gold-rate.services';

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
  selector: 'app-supply',
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
    MatSnackBarModule
  ],
  standalone: true,
  templateUrl: './supply.component.html',
  styleUrls: ['./supply.component.scss']
})
export class SupplyComponent implements OnInit {
  @ViewChild(TransactionComponent) transactionComponent!: TransactionComponent;
  products: Product[] = [];
  editingTransactionIndex: number | null = null;
  isEditing: boolean = false;
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  transactionType?: 'Product' | 'Scrap' | 'Cash' | 'Bank' | 'Money';
  transactionDirection?: 'In' | 'Out';
  wholesalers: Wholesaler[] = [];
  defaultGoldRate = 0;

  supply: Supply = {
    id: undefined,
    date: new Date(),
    user_id: 0,
    description: '',
    transactions: [],
    wholesaler_id: 0,

    total24kProductIn: 0,
    total24kProductOut: 0,
    total24kScrapIn: 0,
    total24kScrapOut: 0,
    total24kIn: 0,
    total24kOut: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    totalBankIn: 0,
    totalBankOut: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supplyService: SupplyService,
    private authService: AuthService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private wholesalersService: WholesalerService,
    private goldRateService: GoldRateService
  ) { }

  ngOnInit() {
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);

    // Set current user ID and date
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.supply.user_id = currentUser.id;
    }
    this.supply.date = new Date();

    this.loadWholesalers();
    this.loadProducts();
    this.loadDefaultGoldRate();
    // Handle route parameters
    this.route.params.subscribe(params => {
      const supplyId = params['id'];
      if (supplyId) {
        this.isEditing = true;
        this.supplyService.getSupply(Number(supplyId)).subscribe({
          next: (supply) => {
            this.supply = supply;
          },
          error: (error) => {
            this.snackBar.open('Senaryo yüklenirken bir hata oluştu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            // Redirect to supplies list if supply not found
            this.router.navigate(['/supplies']);
          }
        });
      } else {
        this.isEditing = false;
        // Reset  for new creation
        this.supply = {
          id: undefined,
          date: new Date(),
          user_id: currentUser?.id || 0,
          wholesaler_id: 0,
          description: '',
          transactions: [],
          total24kProductIn: 0,
          total24kProductOut: 0,
          total24kScrapIn: 0,
          total24kScrapOut: 0,
          total24kIn: 0,
          total24kOut: 0,
          totalCashIn: 0,
          totalCashOut: 0,
          totalBankIn: 0,
          totalBankOut: 0,
        };
      }
    });
  }

  loadWholesalers() {
    this.wholesalersService.getWholesalers().subscribe({
      next: (wholesalers) => {
        this.wholesalers = wholesalers;
      },
      error: (error) => {
        this.snackBar.open('Toptan Alıcılar yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }


  onDefaultGoldRateChange() {
    this.supply.transactions.forEach(transaction => {
      this.recalculateTransaction(transaction, this.defaultGoldRate);
    });
  }

  recalculateTransaction(transaction: Transaction, goldRate: number) {
    transaction.agreed_gold_rate = goldRate;
    if (transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money') {
      transaction.agreed_weight24k = parseFloat(((transaction.amount || 0) / (transaction.agreed_gold_rate || 1)).toFixed(4));
    }
    if (transaction.type === 'Product' && !Boolean(transaction.product?.is_gold)) {
      transaction.agreed_weight24k = parseFloat(((transaction.agreed_price || 0) / transaction.agreed_gold_rate).toFixed(4));
    }
    if ((transaction.type === 'Product' && Boolean(transaction.product?.is_gold)) || transaction.type === 'Scrap') {
      transaction.agreed_weight24k = parseFloat(((transaction.weight_brut || 0) * ((transaction.agreed_milliemes || 0) / 1000) * (transaction.quantity || 1)).toFixed(4));
      transaction.agreed_price = parseFloat(((transaction.agreed_gold_rate) * (transaction.agreed_weight24k || 0)).toFixed(2));
    }



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
    this.goldRateService.getGoldRates().subscribe({
      next: (goldRate) => {
        if (Array.isArray(goldRate)) {
          this.defaultGoldRate = goldRate[0]?.rate || 0;
        } else {
          this.defaultGoldRate = goldRate?.rate || 0;
        }
      }
    });
  }

  openTransactionDrawer(type: 'Product' | 'Scrap' | 'Cash' | 'Bank' | 'Money', direction: 'In' | 'Out') {
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

  onTransactionSubmit(transaction: Transaction) {
    //console.log("Inside Supply onTransactionSubmit:", JSON.stringify(transaction, null, 2));
    if (this.editingTransactionIndex !== null) {
      this.supply.transactions = this.supply.transactions.map((t, i) =>
        i === this.editingTransactionIndex ? transaction : t
      );
      this.editingTransactionIndex = null;
    } else {
      // Add new transaction
      this.supply.transactions = [...this.supply.transactions, transaction];
    }

    // Update row_index for all transactions to match their current position
    this.supply.transactions = this.supply.transactions.map((t, index) => ({
      ...t,
      row_index: index
    }));


    console.log(this.supply.transactions);

    this.isDrawerOpen = false;
  }

  editTransaction(index: number) {
    this.editingTransactionIndex = index;
    const transaction = this.supply.transactions[index];
    this.transactionType = transaction.type;
    this.transactionDirection = transaction.direction;
    this.isDrawerOpen = true;
  }

  deleteTransaction(index: number) {
    this.supply.transactions = this.supply.transactions.filter((_, i) => i !== index);
  }

  navigateToSupplies() {
    this.router.navigate(['/supplies']);
  }

  onSubmit() {
    if (this.supply.transactions.length === 0) {
      return;
    }

    // Create a deep clone of the supply and its transactions
    const supplyToSubmit = {
      ...this.supply,
      transactions: this.supply.transactions.map(transaction => ({ ...transaction }))
    };


    supplyToSubmit.transactions.forEach(transaction => {
      if (transaction.type === 'Product' || transaction.type === 'Scrap') {
        delete transaction.amount;
        if (transaction.type === 'Product') {
          transaction.product_id = transaction.product?.id;
          delete transaction.product;
        }
        if (transaction.type === 'Scrap') {
          delete transaction.quantity;
        }
      }
      if (transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money') {
        delete transaction.product_id;
        delete transaction.weight_brut;
        delete transaction.carat;
        delete transaction.quantity;
        delete transaction.weight24k;
        delete transaction.product;
      }
    });

    let total24kProductIn = 0;
    let total24kProductOut = 0;
    let total24kScrapIn = 0;
    let total24kScrapOut = 0;
    let total24kIn = 0;
    let total24kOut = 0;
    let totalCashIn = 0;
    let totalCashOut = 0;
    let totalBankIn = 0;
    let totalBankOut = 0;

    supplyToSubmit.transactions.forEach(transaction => {
      if (transaction.type === 'Product') {
        const weight = Number(transaction.weight24k || 0);
        if (isNaN(weight)) return;

        if (transaction.direction === 'In') {
          total24kProductIn += weight;
          total24kIn += weight;
        } else {
          total24kProductOut += weight;
          total24kOut += weight;
        }
      }
      if (transaction.type === 'Scrap') {
        const weight = Number(transaction.weight24k || 0);
        if (isNaN(weight)) return;

        if (transaction.direction === 'In') {
          total24kScrapIn += weight;
          total24kIn += weight;
        } else {
          total24kScrapOut += weight;
          total24kOut += weight;
        }
      }
      if (transaction.type === 'Cash') {
        const amount = Number(transaction.amount || 0);
        if (isNaN(amount)) return;

        if (transaction.direction === 'In') {
          totalCashIn += amount;
        } else {
          totalCashOut += amount;
        }
      }
      if (transaction.type === 'Bank') {
        const amount = Number(transaction.amount || 0);
        if (isNaN(amount)) return;

        if (transaction.direction === 'In') {
          totalBankIn += amount;
        } else {
          totalBankOut += amount;
        }
      }
    });

    supplyToSubmit.total24kProductIn = parseFloat(total24kProductIn.toFixed(4));
    supplyToSubmit.total24kProductOut = parseFloat(total24kProductOut.toFixed(4));
    supplyToSubmit.total24kScrapIn = parseFloat(total24kScrapIn.toFixed(4));
    supplyToSubmit.total24kScrapOut = parseFloat(total24kScrapOut.toFixed(4));
    supplyToSubmit.total24kIn = parseFloat(total24kIn.toFixed(4));
    supplyToSubmit.total24kOut = parseFloat(total24kOut.toFixed(4));
    supplyToSubmit.totalCashIn = parseFloat(totalCashIn.toFixed(2));
    supplyToSubmit.totalCashOut = parseFloat(totalCashOut.toFixed(2));
    supplyToSubmit.totalBankIn = parseFloat(totalBankIn.toFixed(2));
    supplyToSubmit.totalBankOut = parseFloat(totalBankOut.toFixed(2));

    if (this.isEditing && this.supply.id) {
      this.supplyService.updateSupply(this.supply.id, supplyToSubmit).subscribe({
        next: () => {
          this.router.navigate(['/supplies']);
        },
        error: (error) => {
          this.snackBar.open('Toptan Alışveriş güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.supplyService.createSupply(supplyToSubmit).subscribe({
        next: () => {
          this.router.navigate(['/supplies']);
        },
        error: (error) => {
          this.snackBar.open('Toptan Alışveriş oluşturulurken bir hata oluştu', 'Kapat', {
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
    const transactions = [...this.supply.transactions];
    const movedItem = transactions[event.previousIndex];
    transactions.splice(event.previousIndex, 1);
    transactions.splice(event.currentIndex, 0, movedItem);

    // Update row_index for all transactions to match their current position
    this.supply.transactions = transactions.map((t, index) => ({
      ...t,
      row_index: index
    }));
  }


  calculateTotal24kProductIn(): number {
    try {
      const total = this.supply.transactions
        .filter(t => t.type === 'Product' && t.direction === 'In')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return parseFloat(total.toFixed(4));
    } catch (error) {
      this.snackBar.open('24k ürün girişi hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return 0;
    }
  }

  calculateTotal24kProductOut(): number {
    try {
      const total = this.supply.transactions
        .filter(t => t.type === 'Product' && t.direction === 'Out')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
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

  calculateTotal24kScrapIn(): number {
    try {
      const total = this.supply.transactions
        .filter(t => t.type === 'Scrap' && t.direction === 'In')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return parseFloat(total.toFixed(4));
    } catch (error) {
      this.snackBar.open('24k çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return 0;
    }
  }

  calculateTotal24kScrapOut(): number {
    try {
      const total = this.supply.transactions
        .filter(t => t.type === 'Scrap' && t.direction === 'Out')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return parseFloat(total.toFixed(4));
    } catch (error) {
      this.snackBar.open('24k çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return 0;
    }
  }

  calculateTotal24kIn(): number {
    try {
      const productIn = this.calculateTotal24kProductIn();
      const scrapIn = this.calculateTotal24kScrapIn();
      const total = (isNaN(productIn) ? 0 : productIn) + (isNaN(scrapIn) ? 0 : scrapIn);
      return parseFloat(total.toFixed(4));
    } catch (error) {
      this.snackBar.open('24k girişi hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return 0;
    }
  }

  calculateTotal24kOut(): number {
    try {
      const productOut = this.calculateTotal24kProductOut();
      const scrapOut = this.calculateTotal24kScrapOut();
      const total = (isNaN(productOut) ? 0 : productOut) + (isNaN(scrapOut) ? 0 : scrapOut);
      return parseFloat(total.toFixed(4));
    } catch (error) {
      this.snackBar.open('24k çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return 0;
    }
  }

  calculateTotalCashIn(): string {
    try {
      const total = this.supply.transactions
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

  calculateTotalCashOut(): string {
    try {
      const total = this.supply.transactions
        .filter(t => t.type === 'Cash' && t.direction === 'Out')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return total.toFixed(2);
    } catch (error) {
      this.snackBar.open('Nakit çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
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
      const total = this.supply.transactions
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

  calculateTotalBankOut(): string {
    try {
      const total = this.supply.transactions
        .filter(t => t.type === 'Bank' && t.direction === 'Out')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return total.toFixed(2);
    } catch (error) {
      this.snackBar.open('Banka çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
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
      this.snackBar.open('Ödeme girişi hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return "0.00";
    }
  }

  calculateTotalPaymentOut(): string {
    try {
      const cashTotal = parseFloat(this.calculateTotalCashOut());
      const bankTotal = parseFloat(this.calculateTotalBankOut());
      return (cashTotal + bankTotal).toFixed(2);
    } catch (error) {
      this.snackBar.open('Ödeme çıkışı hesaplanırken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return "0.00";
    }
  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }

  isOrderValid(): boolean {


    return this.supply.transactions.length > 0
      && this.supply.total24kIn > 0
      && this.supply.total24kOut > 0
      && this.supply.totalCashIn > 0
      && this.supply.totalCashOut > 0
      && this.supply.totalBankIn > 0
      && this.supply.totalBankOut > 0
      && this.supply.wholesaler_id !== 0;
  }

  isNaN(value: any): boolean {
    return Number.isNaN(value);
  }

  getWholesaler(id: number): Wholesaler | undefined {
    return this.wholesalers.find(w => w.id === id);
  }
} 