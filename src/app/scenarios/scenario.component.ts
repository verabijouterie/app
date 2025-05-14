import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Scenario } from '../interfaces/scenario.interface';
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
import { ScenarioService } from '../services/scenario.service';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { TransactionComponent } from '../transactions/transaction.component';
import { ProductsService } from '../services/products.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GoldRateService } from '../services/gold-rate.services';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';




@Component({
  selector: 'app-scenario',
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
    MatSnackBarModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  standalone: true,
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss']
})
export class ScenarioComponent implements OnInit {
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

  scenario: Scenario = {
    id: null,
    date: this.today.toISOString(),
    description: '',
    transactions: [],

    agreedGoldRate: 0,

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
  };

  initialScenario: Scenario | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scenarioService: ScenarioService,
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
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



    this.loadProducts();

    // Handle route parameters
    this.route.params.subscribe(params => {
      const scenarioId = params['id'];
      if (scenarioId) {
        this.isEditing = true;
        this.scenarioService.getScenario(Number(scenarioId)).subscribe({
          next: (scenario) => {
            this.scenario = scenario;
            this.initialScenario = scenario;

            this.isATransactionGold = this.scenario.transactions.some(transaction => transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold));
            this.isATransactionMoney = this.scenario.transactions.some(transaction => transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money');
          },
          error: (error) => {
            this.snackBar.open('Senaryo yüklenirken bir hata oluştu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
            // Redirect to scenarios list if scenario not found
            this.router.navigate(['/scenarios']);
          }
        });
      } else {
        this.isEditing = false;
        // Reset scenario for new creation
        this.scenario = {
          id: null,
          date: this.today.toISOString(),
          description: '',
          transactions: [],
          agreedGoldRate: 0,
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
          this.scenario.agreedGoldRate = this.defaultGoldRate;
        }
      }
    });
  }

  onGoldRateChange() {
    this.scenario.transactions.forEach(transaction => {
      this.recalculateTransaction(transaction, this.scenario.agreedGoldRate);
    });

    this.recalculateTotals();
  }

  onDateChange() {
    this.scenario.transactions.forEach(transaction => {
      transaction.date = this.scenario.date;
    });
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
    transaction.date = this.scenario.date;

    if (this.editingTransactionIndex !== null) {
      this.scenario.transactions = this.scenario.transactions.map((t, i) =>
        i === this.editingTransactionIndex ? transaction : t
      );
      this.editingTransactionIndex = null;
    } else {
      // Add new transaction
      this.scenario.transactions = [...this.scenario.transactions, transaction];
    }

    this.isATransactionGold = this.scenario.transactions.some(transaction => transaction.type === 'Product' && (transaction.product?.is_gold || transaction.product?.contains_gold));
    this.isATransactionMoney = this.scenario.transactions.some(transaction => transaction.type === 'Cash' || transaction.type === 'Bank' || transaction.type === 'Money');

    this.recalculateTotals();

    console.log("OnTransactionSubmit:", this.scenario.transactions);
    this.isDrawerOpen = false;
  }

  editTransaction(index: number) {
    this.editingTransactionIndex = index;
    const transaction = this.scenario.transactions[index];
    this.transactionType = transaction.type;
    this.transactionDirection = transaction.direction;
    this.isDrawerOpen = true;
  }

  deleteTransaction(index: number) {
    this.scenario.transactions = this.scenario.transactions.filter((_, i) => i !== index);
    this.recalculateTotals();
  }

  navigateToScenarios() {
    this.router.navigate(['/scenarios']);
  }

  onSubmit() {
    // If we're editing, check if there are any changes
    if (this.isEditing && this.initialScenario) {
      const hasChanges = this.hasScenarioChanged(this.initialScenario, this.scenario);

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
    if (this.isEditing && this.scenario.id) {
      this.scenarioService.updateScenario(this.scenario.id, this.scenario).subscribe({
        next: (response) => {

          this.initialScenario = { ...(response as any).scenario };
          this.scenario = (response as any).scenario;
          this.snackBar.open('Alışveriş güncellendi', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['info-snackbar']
          });

          //this.router.navigate(['/supplies']);
        },
        error: (error) => {
          this.snackBar.open('Alışveriş güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.scenarioService.createScenario(this.scenario).subscribe({
        next: (response) => {
          this.initialScenario = { ...(response as any).scenario };
          this.scenario = (response as any).scenario;
          this.isEditing = true;
          this.snackBar.open('Alışveriş oluşturuldu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['info-snackbar']
          });
          //this.router.navigate(['/scenarios']);
        },
        error: (error) => {
          this.snackBar.open('Alışveriş oluşturulurken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }


  private hasScenarioChanged(initial: Scenario, current: Scenario): boolean {
    // Compare basic properties
    if (initial.description !== current.description ||
      initial.agreedGoldRate !== current.agreedGoldRate ||
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
        currentTransaction.amount !== initialTransaction.amount) {
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

    this.scenario.transactions.forEach(transaction => {
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


    this.scenario.total24kProductIn = parseFloat(total24kProductIn.toFixed(4));
    this.scenario.total24kProductOut = parseFloat(total24kProductOut.toFixed(4));
    this.scenario.total24kScrapIn = parseFloat(total24kScrapIn.toFixed(4));
    this.scenario.total24kScrapOut = parseFloat(total24kScrapOut.toFixed(4));
    this.scenario.total24kIn = parseFloat(total24kIn.toFixed(4));
    this.scenario.total24kOut = parseFloat(total24kOut.toFixed(4));
    this.scenario.total24k = parseFloat(total24k.toFixed(4));

    this.scenario.totalCashIn = parseFloat(totalCashIn.toFixed(2));
    this.scenario.totalCashOut = parseFloat(totalCashOut.toFixed(2));
    this.scenario.totalBankIn = parseFloat(totalBankIn.toFixed(2));
    this.scenario.totalBankOut = parseFloat(totalBankOut.toFixed(2));
    this.scenario.totalMoneyIn = parseFloat(totalMoneyIn.toFixed(2));
    this.scenario.totalMoneyOut = parseFloat(totalMoneyOut.toFixed(2));
    this.scenario.totalMoney = parseFloat(totalMoney.toFixed(2));

    console.log("Recalculated Totals:", this.scenario);


  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }

  isOrderValid(): boolean {
    return this.scenario.transactions.length > 0
  }

  isNaN(value: any): boolean {
    return Number.isNaN(value);
  }



  


} 