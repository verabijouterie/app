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
import { AuthService } from '../services/auth.service';
import { ProductsService } from '../services/products.service';

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
        TransactionComponent
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
  drawerType?: 'Product' | 'Scrap' | 'Cash' | 'Bank';
  drawerDirection?: 'In' | 'Out';
  
  scenario: Scenario = {
    id: undefined,
    date: new Date(),
    user_id: 0,
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scenarioService: ScenarioService,
    private authService: AuthService,
    private productsService: ProductsService
  ) {}

  ngOnInit() {
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);

    // Set current user ID and date
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.scenario.user_id = currentUser.id;
    }
    this.scenario.date = new Date();

    // Load products
    this.productsService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });

    // Handle route parameters
    this.route.params.subscribe(params => {
      const scenarioId = params['id'];
      if (scenarioId) {
        this.isEditing = true;
        this.scenarioService.getScenario(Number(scenarioId)).subscribe({
          next: (scenario) => {
            this.scenario = scenario;
          },
          error: (error) => {
            console.error('Error loading scenario:', error);
            // Redirect to scenarios list if scenario not found
            this.router.navigate(['/scenarios']);
          }
        });
      } else {
        this.isEditing = false;
        // Reset scenario for new creation
        this.scenario = {
          id: undefined,
          date: new Date(),
          user_id: currentUser?.id || 0,
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

  openTransactionDrawer(type: 'Product' | 'Scrap' | 'Cash' | 'Bank', direction: 'In' | 'Out') {
    this.drawerType = type;
    this.drawerDirection = direction;
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
    if (this.editingTransactionIndex !== null) {
      // Update existing transaction
      this.scenario.transactions = this.scenario.transactions.map((t, i) => 
        i === this.editingTransactionIndex ? transaction : t
      );
      this.editingTransactionIndex = null;
    } else {
      // Add new transaction
      this.scenario.transactions = [...this.scenario.transactions, transaction];
    }
    
    // Update row_index for all transactions to match their current position
    this.scenario.transactions = this.scenario.transactions.map((t, index) => ({
      ...t,
      row_index: index
    }));

    this.isDrawerOpen = false;
  }

  editTransaction(index: number) {
    this.editingTransactionIndex = index;
    const transaction = this.scenario.transactions[index];
    this.drawerType = transaction.type;
    this.drawerDirection = transaction.direction;
    this.isDrawerOpen = true;
  }

  deleteTransaction(index: number) {
    this.scenario.transactions = this.scenario.transactions.filter((_, i) => i !== index);
  }

  navigateToScenarios() {
    this.router.navigate(['/scenarios']);
  }

  onSubmit() {
    if (this.scenario.transactions.length === 0) {
      return;
    }

    // Create a deep clone of the scenario and its transactions
    const scenarioToSubmit = {
      ...this.scenario,
      transactions: this.scenario.transactions.map(transaction => ({...transaction}))
    };

    scenarioToSubmit.transactions.forEach(transaction => {
      if(transaction.type === 'Product' || transaction.type === 'Scrap') {
        delete transaction.amount;
        if (transaction.type === 'Product') {
          transaction.product_id = transaction.product?.id;
          delete transaction.product;
        }
        if(transaction.type === 'Scrap') {
          delete transaction.quantity;
        }
      }
      if(transaction.type === 'Cash' || transaction.type === 'Bank') {
        delete transaction.product_id;
        delete transaction.weight;
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

    scenarioToSubmit.transactions.forEach(transaction => {
      if(transaction.type === 'Product') {
        const weight = Number(transaction.weight24k || 0);
        if(isNaN(weight)) return;
        
        if(transaction.direction === 'In') {
          total24kProductIn += weight;
          total24kIn += weight;
        } else {
          total24kProductOut += weight;
          total24kOut += weight;
        }
      }
      if(transaction.type === 'Scrap') {
        const weight = Number(transaction.weight24k || 0);
        if(isNaN(weight)) return;
        
        if(transaction.direction === 'In') {
          total24kScrapIn += weight;
          total24kIn += weight;
        } else {
          total24kScrapOut += weight;
          total24kOut += weight;
        }
      }
      if(transaction.type === 'Cash') {
        const amount = Number(transaction.amount || 0);
        if(isNaN(amount)) return;
        
        if(transaction.direction === 'In') {
          totalCashIn += amount;
        } else {
          totalCashOut += amount;
        }
      }
      if(transaction.type === 'Bank') {
        const amount = Number(transaction.amount || 0);
        if(isNaN(amount)) return;
        
        if(transaction.direction === 'In') {
          totalBankIn += amount;
        } else {
          totalBankOut += amount;
        }
      }
    });

    scenarioToSubmit.total24kProductIn = Number(total24kProductIn.toFixed(4));
    scenarioToSubmit.total24kProductOut = Number(total24kProductOut.toFixed(4));
    scenarioToSubmit.total24kScrapIn = Number(total24kScrapIn.toFixed(4));
    scenarioToSubmit.total24kScrapOut = Number(total24kScrapOut.toFixed(4));
    scenarioToSubmit.total24kIn = Number(total24kIn.toFixed(4));
    scenarioToSubmit.total24kOut = Number(total24kOut.toFixed(4));
    scenarioToSubmit.totalCashIn = Number(totalCashIn.toFixed(2));
    scenarioToSubmit.totalCashOut = Number(totalCashOut.toFixed(2));
    scenarioToSubmit.totalBankIn = Number(totalBankIn.toFixed(2));
    scenarioToSubmit.totalBankOut = Number(totalBankOut.toFixed(2));

    if (this.isEditing && this.scenario.id) {
      this.scenarioService.updateScenario(this.scenario.id, scenarioToSubmit).subscribe({
        next: () => {
          this.router.navigate(['/scenarios']);
        },
        error: (error) => {
          console.error('Error updating scenario:', error);
        }
      });
    } else {
      this.scenarioService.createScenario(scenarioToSubmit).subscribe({
        next: () => {
          this.router.navigate(['/scenarios']);
        },
        error: (error) => {
          console.error('Error creating scenario:', error);
        }
      });
    }
  }

  drop(event: CdkDragDrop<Transaction[]>) {
    const transactions = [...this.scenario.transactions];
    const movedItem = transactions[event.previousIndex];
    transactions.splice(event.previousIndex, 1);
    transactions.splice(event.currentIndex, 0, movedItem);
    
    // Update row_index for all transactions to match their current position
    this.scenario.transactions = transactions.map((t, index) => ({
      ...t,
      row_index: index
    }));
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  calculateTotal24kProductIn(): number {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Product' && t.direction === 'In')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return Number(total.toFixed(4));
    } catch (error) {
      console.error('Error in calculateTotal24kProductIn', error);
      return 0;
    }
  }

  calculateTotal24kProductOut(): number {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Product' && t.direction === 'Out')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return Number(total.toFixed(4));
    } catch (error) {
      console.error('Error in calculateTotal24kProductOut', error);
      return 0;
    }
  }

  calculateTotal24kScrapIn(): number {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Scrap' && t.direction === 'In')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return Number(total.toFixed(4));
    } catch (error) {
      console.error('Error in calculateTotal24kScrapIn', error);
      return 0;
    }
  }

  calculateTotal24kScrapOut(): number {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Scrap' && t.direction === 'Out')
        .reduce((sum, t) => {
          const weight = Number(t.weight24k || 0);
          return sum + (isNaN(weight) ? 0 : weight);
        }, 0);
      return Number(total.toFixed(4));
    } catch (error) {
      console.error('Error in calculateTotal24kScrapOut', error);
      return 0;
    }
  }

  calculateTotal24kIn(): number {
    try {
      const productIn = this.calculateTotal24kProductIn();
      const scrapIn = this.calculateTotal24kScrapIn();
      const total = (isNaN(productIn) ? 0 : productIn) + (isNaN(scrapIn) ? 0 : scrapIn);
      return Number(total.toFixed(4));
    } catch (error) {
      console.error('Error in calculateTotal24kIn', error);
      return 0;
    }
  }

  calculateTotal24kOut(): number {
    try {
      const productOut = this.calculateTotal24kProductOut();
      const scrapOut = this.calculateTotal24kScrapOut();
      const total = (isNaN(productOut) ? 0 : productOut) + (isNaN(scrapOut) ? 0 : scrapOut);
      return Number(total.toFixed(4));
    } catch (error) {
      console.error('Error in calculateTotal24kOut', error);
      return 0;
    }
  }

  calculateTotalCashIn(): string {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Cash' && t.direction === 'In')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return Number(total).toFixed(2);
    } catch (error) {
      console.error('Error in calculateTotalCashIn', error);
      return "0.00";
    }
  }

  calculateTotalCashOut(): string {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Cash' && t.direction === 'Out')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return Number(total).toFixed(2);
    } catch (error) {
      console.error('Error in calculateTotalCashOut', error);
      return "0.00";
    }
  }

  calculateTotalBankIn(): string {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Bank' && t.direction === 'In')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return Number(total).toFixed(2);
    } catch (error) {
      console.error('Error in calculateTotalBankIn', error);
      return "0.00";
    }
  }

  calculateTotalBankOut(): string {
    try {
      const total = this.scenario.transactions
        .filter(t => t.type === 'Bank' && t.direction === 'Out')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      return Number(total).toFixed(2);
    } catch (error) {
      console.error('Error in calculateTotalBankOut', error);
      return "0.00";
    }
  }

  calculateTotalPaymentIn(): string {
    return (Number(this.calculateTotalCashIn()) + Number(this.calculateTotalBankIn())).toFixed(2);
  }

  calculateTotalPaymentOut(): string {
    return (Number(this.calculateTotalCashOut()) + Number(this.calculateTotalBankOut())).toFixed(2);
  }

  formatAmount(amount: any): string {
    // Safely convert to number and format with 2 decimal places
    if (amount === null || amount === undefined) return "0.00";
    const num = Number(amount);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  }
} 