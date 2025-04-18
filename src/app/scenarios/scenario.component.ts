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
        if(transaction.direction === 'In') {
          total24kProductIn += transaction.weight24k!;
          total24kIn += transaction.weight24k!;
        } else {
          total24kProductOut += transaction.weight24k!;
          total24kOut += transaction.weight24k!;
        }
      }
      if(transaction.type === 'Scrap') {
        if(transaction.direction === 'In') {
          total24kScrapIn += transaction.weight24k!;
          total24kIn += transaction.weight24k!;
        } else {
          total24kScrapOut += transaction.weight24k!;
          total24kOut += transaction.weight24k!;
        }
      }
      if(transaction.type === 'Cash') {
        if(transaction.direction === 'In') {
          totalCashIn += transaction.amount!;
        } else {
          totalCashOut += transaction.amount!;
        }
      }
      if(transaction.type === 'Bank') {
        if(transaction.direction === 'In') {
          totalBankIn += transaction.amount!;
        } else {
          totalBankOut += transaction.amount!;
        }
      }
    });

    scenarioToSubmit.total24kProductIn = total24kProductIn;
    scenarioToSubmit.total24kProductOut = total24kProductOut;
    scenarioToSubmit.total24kScrapIn = total24kScrapIn;
    scenarioToSubmit.total24kScrapOut = total24kScrapOut;
    scenarioToSubmit.total24kIn = total24kIn;
    scenarioToSubmit.total24kOut = total24kOut;
    scenarioToSubmit.totalCashIn = totalCashIn;
    scenarioToSubmit.totalCashOut = totalCashOut;
    scenarioToSubmit.totalBankIn = totalBankIn;
    scenarioToSubmit.totalBankOut = totalBankOut;

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
    return this.scenario.transactions
      .filter(t => t.type === 'Product' && t.direction === 'In')
      .reduce((sum, t) => sum + (t.weight24k || 0), 0);
  }

  calculateTotal24kProductOut(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Product' && t.direction === 'Out')
      .reduce((sum, t) => sum + (t.weight24k || 0), 0);
  }

  calculateTotal24kScrapIn(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Scrap' && t.direction === 'In')
      .reduce((sum, t) => sum + (t.weight24k || 0), 0);
  }

  calculateTotal24kScrapOut(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Scrap' && t.direction === 'Out')
      .reduce((sum, t) => sum + (t.weight24k || 0), 0);
  }

  calculateTotal24kIn(): number {
    return this.calculateTotal24kProductIn() + this.calculateTotal24kScrapIn();
  }

  calculateTotal24kOut(): number {
    return this.calculateTotal24kProductOut() + this.calculateTotal24kScrapOut();
  }

  calculateTotalCashIn(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Cash' && t.direction === 'In')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  calculateTotalCashOut(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Cash' && t.direction === 'Out')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  calculateTotalBankIn(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Bank' && t.direction === 'In')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  calculateTotalBankOut(): number {
    return this.scenario.transactions
      .filter(t => t.type === 'Bank' && t.direction === 'Out')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }
} 