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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';


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
    DrawerComponent,
    TransactionComponent,
    MatSnackBarModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter()
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
  isDrawerAnimationComplete = false;
  transactionType?: 'Product' | 'Scrap' | 'Cash' | 'Bank' | 'Money';
  transactionDirection?: 'In' | 'Out';
  wholesalers: Wholesaler[] = [];
  defaultGoldRate = 0;
  initialTransactions: Transaction[] = [];

  isATransactionPaiableAsCashOnly = false;
  isATransactionPaiableAsGoldOnly = false;

  today: Date = new Date();

  supply: Supply = {
    id: null,
    date: this.today.toISOString(),
    description: '',
    transactions: [],
    wholesaler_id: 0,

    agreedTotalProductsInAs24K: 0,
    agreedTotalProductsOutAs24K: 0,
    agreedTotalScrapInAs24K: 0,
    agreedTotalScrapOutAs24K: 0,
    agreedTotalMoneyInAs24K: 0,
    agreedTotalMoneyOutAs24K: 0,
    agreedTotalInAs24K: 0,
    agreedTotalOutAs24K: 0,
    agreedTotalAs24K: 0,
    agreedTotalProductsInAsMoney: 0,
    agreedTotalProductsOutAsMoney: 0,
    agreedTotalScrapInAsMoney: 0,
    agreedTotalScrapOutAsMoney: 0,
    agreedTotalMoneyInAsMoney: 0,
    agreedTotalMoneyOutAsMoney: 0,
    agreedTotalInAsMoney: 0,
    agreedTotalOutAsMoney: 0,
    agreedTotalAsMoney: 0,

  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supplyService: SupplyService,
    private authService: AuthService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private wholesalersService: WholesalerService,
    private goldRateService: GoldRateService,
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
    this.supply.date = this.today.toISOString();

    //console.log(this.today.toISOString());

    // Set current user ID and date
    //const currentUser = this.authService.currentUser;

    this.supply.date = new Date().toISOString();

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
            this.initialTransactions = supply.transactions;
            this.isATransactionPaiableAsCashOnly = supply.transactions.some(t => t.paiable_as_cash_only);
            this.isATransactionPaiableAsGoldOnly = supply.transactions.some(t => !t.paiable_as_cash_only);
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
        this.initialTransactions = [];
        // Reset  for new creation
        this.supply = {
          id: null,
          date: this.today.toISOString(),
          wholesaler_id: 0,
          description: '',
          transactions: [],

          agreedTotalProductsInAs24K: 0,
          agreedTotalProductsOutAs24K: 0,
          agreedTotalScrapInAs24K: 0,
          agreedTotalScrapOutAs24K: 0,
          agreedTotalMoneyInAs24K: 0,
          agreedTotalMoneyOutAs24K: 0,
          agreedTotalInAs24K: 0,
          agreedTotalOutAs24K: 0,
          agreedTotalAs24K: 0,

          agreedTotalProductsInAsMoney: 0,
          agreedTotalProductsOutAsMoney: 0,
          agreedTotalScrapInAsMoney: 0,
          agreedTotalScrapOutAsMoney: 0,
          agreedTotalMoneyInAsMoney: 0,
          agreedTotalMoneyOutAsMoney: 0,
          agreedTotalInAsMoney: 0,
          agreedTotalOutAsMoney: 0,
          agreedTotalAsMoney: 0,
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

    this.recalculateTotals();
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
      this.supply.transactions = this.supply.transactions.map((t, i) =>
        i === this.editingTransactionIndex ? transaction : t
      );
      this.editingTransactionIndex = null;
    } else {
      // Add new transaction
      this.supply.transactions = [...this.supply.transactions, transaction];
    }

    this.isATransactionPaiableAsCashOnly = this.supply.transactions.some(t => t.paiable_as_cash_only);
    this.isATransactionPaiableAsGoldOnly = this.supply.transactions.some(t => !t.paiable_as_cash_only);

    this.recalculateTotals();

    console.log("OnTransactionSubmit:", this.supply.transactions);
    this.isDrawerOpen = false;
  }

  editTransaction(index: number) {

    console.log(this.supply.transactions);

    this.editingTransactionIndex = index;
    const transaction = this.supply.transactions[index];
    this.transactionType = transaction.type;
    this.transactionDirection = transaction.direction;
    this.isDrawerOpen = true;
  }

  deleteTransaction(index: number) {
    this.supply.transactions = this.supply.transactions.filter((_, i) => i !== index);

    this.recalculateTotals();
  }

  navigateToSupplies() {
    this.router.navigate(['/supplies']);
  }

  onSubmit() {


    if (this.supply.transactions.length === 0) {
      return;
    }

    // Compare transactions before submitting
    if (this.areTransactionsChanged()) {
      return;
    }


    if (this.isEditing && this.supply.id) {
      this.supplyService.updateSupply(this.supply.id, this.supply).subscribe({
        next: (supply) => {
          this.initialTransactions = supply.transactions;
          //this.router.navigate(['/supplies']);
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
      this.supplyService.createSupply(this.supply).subscribe({
        next: (supply) => {
          this.initialTransactions = supply.transactions;
          //this.router.navigate(['/supplies']);
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


  recalculateTotals() {
    let agreedTotal24kProductIn = 0;
    let agreedTotal24kProductOut = 0;
    let agreedTotal24kScrapIn = 0;
    let agreedTotal24kScrapOut = 0;
    let agreedTotalMoneyIn = 0;
    let agreedTotalMoneyOut = 0;
    let agreedTotalIn = 0;
    let agreedTotalOut = 0;
    let agreedTotalAs24K = 0;

    let agreedTotalProductsInAsMoney = 0;
    let agreedTotalProductsOutAsMoney = 0;
    let agreedTotalScrapInAsMoney = 0;
    let agreedTotalScrapOutAsMoney = 0;
    let agreedTotalMoneyInAsMoney = 0;
    let agreedTotalMoneyOutAsMoney = 0;
    let agreedTotalInAsMoney = 0;
    let agreedTotalOutAsMoney = 0;
    let agreedTotalAsMoney = 0;

    this.supply.transactions.forEach(transaction => {
      // Calculate as gold
      if (!transaction.paiable_as_cash_only) {
        if (transaction.type === 'Product') {
          if (transaction.direction === 'In') {
            agreedTotal24kProductIn += Number(transaction.agreed_weight24k || 0);
            agreedTotalIn += Number(transaction.agreed_weight24k || 0);
            agreedTotalAs24K += Number(transaction.agreed_weight24k || 0);
          } else {
            agreedTotal24kProductOut += Number(transaction.agreed_weight24k || 0);
            agreedTotalOut += Number(transaction.agreed_weight24k || 0);
            agreedTotalAs24K -= Number(transaction.agreed_weight24k || 0);
          }
        }
        if (transaction.type === 'Scrap') {
          if (transaction.direction === 'In') {
            agreedTotal24kScrapIn += Number(transaction.agreed_weight24k || 0);
            agreedTotalIn += Number(transaction.agreed_weight24k || 0);
            agreedTotalAs24K += Number(transaction.agreed_weight24k || 0);
          } else {
            agreedTotal24kScrapOut += Number(transaction.agreed_weight24k || 0);
            agreedTotalOut += Number(transaction.agreed_weight24k || 0);
            agreedTotalAs24K -= Number(transaction.agreed_weight24k || 0);
          }
        }
        if (transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money') {
          if (transaction.direction === 'In') {
            agreedTotalMoneyIn += Number(transaction.agreed_weight24k || 0);
            agreedTotalIn += Number(transaction.agreed_weight24k || 0);
            agreedTotalAs24K += Number(transaction.agreed_weight24k || 0);
          } else {
            agreedTotalMoneyOut += Number(transaction.agreed_weight24k || 0);
            agreedTotalOut += Number(transaction.agreed_weight24k || 0);
            agreedTotalAs24K -= Number(transaction.agreed_weight24k || 0);
          }
        }
      }
      else {
        if (transaction.type === 'Product') {
          if (transaction.direction === 'In') {
            agreedTotalProductsInAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalInAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalAsMoney += Number(transaction.agreed_price || 0);
          }
          else {
            agreedTotalProductsOutAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalOutAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalAsMoney -= Number(transaction.agreed_price || 0);
          }
        }
        if (transaction.type === 'Scrap') {
          if (transaction.direction === 'In') {
            agreedTotalScrapInAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalInAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalAsMoney += Number(transaction.agreed_price || 0);
          }
          else {
            agreedTotalScrapOutAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalOutAsMoney += Number(transaction.agreed_price || 0);
            agreedTotalAsMoney -= Number(transaction.agreed_price || 0);
          }
        }
        if (transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money') {
          if (transaction.direction === 'In') {
            agreedTotalMoneyInAsMoney += Number(transaction.amount || 0);
            agreedTotalInAsMoney += Number(transaction.amount || 0);
            agreedTotalAsMoney += Number(transaction.amount || 0);
          }
          else {
            agreedTotalMoneyOutAsMoney += Number(transaction.amount || 0);
            agreedTotalOutAsMoney += Number(transaction.amount || 0);
            agreedTotalAsMoney -= Number(transaction.amount || 0);
          }
        }
      }
    });
    

    this.supply.agreedTotalProductsInAs24K = parseFloat(agreedTotal24kProductIn.toFixed(4));
    this.supply.agreedTotalProductsOutAs24K = parseFloat(agreedTotal24kProductOut.toFixed(4));
    this.supply.agreedTotalScrapInAs24K = parseFloat(agreedTotal24kScrapIn.toFixed(4));
    this.supply.agreedTotalScrapOutAs24K = parseFloat(agreedTotal24kScrapOut.toFixed(4));
    this.supply.agreedTotalMoneyInAs24K = parseFloat(agreedTotalMoneyIn.toFixed(4));
    this.supply.agreedTotalMoneyOutAs24K = parseFloat(agreedTotalMoneyOut.toFixed(4));
    this.supply.agreedTotalInAs24K = parseFloat(agreedTotalIn.toFixed(4));
    this.supply.agreedTotalOutAs24K = parseFloat(agreedTotalOut.toFixed(4));
    this.supply.agreedTotalAs24K = parseFloat(agreedTotalAs24K.toFixed(4));

    this.supply.agreedTotalProductsInAsMoney = parseFloat(agreedTotalProductsInAsMoney.toFixed(4));
    this.supply.agreedTotalProductsOutAsMoney = parseFloat(agreedTotalProductsOutAsMoney.toFixed(4));
    this.supply.agreedTotalScrapInAsMoney = parseFloat(agreedTotalScrapInAsMoney.toFixed(4));
    this.supply.agreedTotalScrapOutAsMoney = parseFloat(agreedTotalScrapOutAsMoney.toFixed(4));
    this.supply.agreedTotalMoneyInAsMoney = parseFloat(agreedTotalMoneyInAsMoney.toFixed(4));
    this.supply.agreedTotalMoneyOutAsMoney = parseFloat(agreedTotalMoneyOutAsMoney.toFixed(4));
    this.supply.agreedTotalInAsMoney = parseFloat(agreedTotalInAsMoney.toFixed(4));
    this.supply.agreedTotalOutAsMoney = parseFloat(agreedTotalOutAsMoney.toFixed(4));
    this.supply.agreedTotalAsMoney = parseFloat(agreedTotalAsMoney.toFixed(4));

    
  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }

  isOrderValid(): boolean {
    return this.supply.transactions.length > 0
      && this.supply.wholesaler_id !== 0;
  }

  isNaN(value: any): boolean {
    return Number.isNaN(value);
  }

  getWholesaler(id: number): Wholesaler | undefined {
    return this.wholesalers.find(w => w.id === id);
  }

  // Compare transactions before submitting
  private areTransactionsChanged() {
    // Reset tracking arrays
    const addedTransactions: Transaction[] = [];
    const removedTransactions: Transaction[] = [];
    const unchangedTransactions: Transaction[] = [];

    // Find added and unchanged transactions
    this.supply.transactions.forEach(currentTransaction => {
      if (!currentTransaction.id) {
        // No ID means this is a new transaction
        addedTransactions.push(currentTransaction);
      } else {
        // Has ID, find the initial transaction
        const initialTransaction = this.initialTransactions.find(
          initial => initial.id === currentTransaction.id
        );

        if (initialTransaction) {
          // Compare to see if it's been modified
          const isUnchanged = this.areTransactionsEqual(initialTransaction, currentTransaction);
          if (isUnchanged) {
            unchangedTransactions.push(currentTransaction);
          } else {
            // Modified transaction
            removedTransactions.push(initialTransaction);
            addedTransactions.push(currentTransaction);
          }
        }
        else {
          // This shouldn't happen, but just in case
          console.error("Initial transaction not found for:", currentTransaction);
        }
      }
    });

    // Find removed transactions (transactions with IDs that are no longer in the list)
    this.initialTransactions.forEach(initialTransaction => {
      if (initialTransaction.id) {
        const stillExists = this.supply.transactions.some(
          current => current.id === initialTransaction.id
        );
        if (!stillExists) {
          removedTransactions.push(initialTransaction);
        }
      }
    });

    //console.log("Added transactions:", addedTransactions);
    //console.log("Removed transactions:", removedTransactions);
    //console.log("Unchanged transactions:", unchangedTransactions);


    if (addedTransactions.length > 0 || removedTransactions.length > 0) {
      return true;
    }
    return false;
  }

  private areTransactionsEqual(t1: Transaction, t2: Transaction): boolean {
    // Compare all relevant properties
    return (
      t1.type === t2.type &&
      t1.direction === t2.direction &&
      t1.quantity === t2.quantity &&
      t1.weight_brut === t2.weight_brut &&
      t1.carat === t2.carat &&
      t1.agreed_milliemes === t2.agreed_milliemes &&
      t1.agreed_price === t2.agreed_price &&
      t1.agreed_weight24k === t2.agreed_weight24k &&
      t1.weight24k === t2.weight24k &&
      t1.amount === t2.amount &&
      t1.product_id === t2.product_id &&
      t1.paiable_as_cash_only === t2.paiable_as_cash_only
    );
  }
} 