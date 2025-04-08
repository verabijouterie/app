import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Scenario } from '../interfaces/scenario.interface';
import { User } from '../interfaces/user.interface';
import { mockUsers } from '../mockup/mock-users';
import { mockProducts } from '../mockup/mock-products';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Transaction } from '../interfaces/transaction.interface';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { mockRate } from '../mockup/mock-rate';
import { ActivatedRoute, Router } from '@angular/router';
import { mockScenarios } from '../mockup/mock-scenarios';
import { Product } from '../interfaces/product.interface';
import { ScenarioService } from '../services/scenario.service';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { TransactionComponent } from '../transactions/transaction.component';

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
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        DragDropModule,
        DrawerComponent,
        TransactionComponent
    ],
    standalone: true,
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
        },
        {
            provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
            useValue: { strict: true },
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
    templateUrl: './scenario.component.html',
    styleUrls: ['./scenario.component.scss']
})
export class ScenarioComponent implements OnInit {
  users: User[] = mockUsers;
  products: Product[] = mockProducts;
  editingTransactionIndex: number | null = null;
  isEditing: boolean = false;
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  drawerType?: 'Product' | 'Scrap' | 'Cash' | 'Bank';
  drawerDirection?: 'In' | 'Out';
  
  scenario: Scenario = {
    id: undefined,
    date: new Date(),
    user_id: this.users[0].id,
    description: '',
    transactions: [],
    currentRate: mockRate,
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
    private scenarioService: ScenarioService
  ) {}

  ngOnInit() {
    // Enable animations after initial load
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);

    const scenarioId = this.route.snapshot.paramMap.get('id');
    if (scenarioId) {
      this.isEditing = true;
      this.scenarioService.getScenario(Number(scenarioId)).subscribe({
        next: (scenario) => {
          this.scenario = scenario;
        },
        error: (error) => {
          console.error('Error loading scenario:', error);
        }
      });
    }
  }

  openTransactionDrawer(type: 'Product' | 'Scrap' | 'Cash' | 'Bank', direction: 'In' | 'Out') {
    this.drawerType = type;
    this.drawerDirection = direction;
    this.isDrawerOpen = true;
  }

  onDrawerClose() {
    this.isDrawerOpen = false;
    this.editingTransactionIndex = null;
  }

  onCancel() {
    this.onDrawerClose();
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

  onSubmit() {
    this.scenario.transactions.forEach(transaction => {
      if(transaction.type === 'Product' || transaction.type === 'Scrap') {
        delete transaction.amount;
        if (transaction.type === 'Product') {
          transaction.product_id = transaction.product?.id;
          delete transaction.product;
        }
      }
      if(transaction.type === 'Cash' || transaction.type === 'Bank') {
        delete transaction.product_id;
        delete transaction.weight;
        delete transaction.carat;
        delete transaction.quantity;
        delete transaction.total24KWeight;
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

    this.scenario.transactions.forEach(transaction => {
      if(transaction.type === 'Product') {
        if(transaction.direction === 'In') {
          total24kProductIn += transaction.total24KWeight!;
          total24kIn += transaction.total24KWeight!;
        } else {
          total24kProductOut += transaction.total24KWeight!;
          total24kOut += transaction.total24KWeight!;
        }
      }
      if(transaction.type === 'Scrap') {
        if(transaction.direction === 'In') {
          total24kScrapIn += transaction.total24KWeight!;
          total24kIn += transaction.total24KWeight!;
        } else {
          total24kScrapOut += transaction.total24KWeight!;
          total24kOut += transaction.total24KWeight!;
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

    this.scenario.total24kProductIn = total24kProductIn;
    this.scenario.total24kProductOut = total24kProductOut;
    this.scenario.total24kScrapIn = total24kScrapIn;
    this.scenario.total24kScrapOut = total24kScrapOut;
    this.scenario.total24kIn = total24kIn;
    this.scenario.total24kOut = total24kOut;
    this.scenario.totalCashIn = totalCashIn;
    this.scenario.totalCashOut = totalCashOut;
    this.scenario.totalBankIn = totalBankIn;
    this.scenario.totalBankOut = totalBankOut;

    if (this.isEditing && this.scenario.id) {
      this.scenarioService.updateScenario(this.scenario.id, this.scenario).subscribe(
        () => {
          this.router.navigate(['/scenarios']);
        },
        error => {
          console.error('Error updating scenario:', error);
        }
      );
    } else {
      this.scenarioService.createScenario(this.scenario).subscribe(
        () => {
          this.router.navigate(['/scenarios']);
        },
        error => {
          console.error('Error creating scenario:', error);
        }
      );
    }
  }

  drop(event: CdkDragDrop<Transaction[]>) {
    const transactions = [...this.scenario.transactions];
    const movedItem = transactions[event.previousIndex];
    transactions.splice(event.previousIndex, 1);
    transactions.splice(event.currentIndex, 0, movedItem);
    this.scenario.transactions = transactions;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }
} 