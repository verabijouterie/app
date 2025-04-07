import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { Scenario } from '../interfaces/scenario.interface';
import { ScenarioService } from '../services/scenario.service';

@Component({
    selector: 'app-scenario-list',
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './scenario-list.component.html',
    styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent implements OnInit {
  scenarios: Scenario[] = [];
  displayedColumns: string[] = [
    'date', 
    'user', 
    'description', 
    'currentRate', 
    'total24kProductIn', 
    'total24kProductOut',
    'total24kScrapIn',
    'total24kScrapOut',
    'total24kIn',
    'total24kOut',
    'totalCashIn',
    'totalCashOut',
    'totalBankIn',
    'totalBankOut',
    'transactions', 
    'actions'
  ];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private scenarioService: ScenarioService
  ) { }

  ngOnInit(): void {
    this.loadScenarios();
    // Subscribe to route changes to refresh the list when returning from edit
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadScenarios();
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getTransactionSummary(transactions: any[]): string {
    return transactions.map(t => `${t.type} ${t.direction}`).join(', ');
  }

  viewScenario(scenario: Scenario): void {
    // TODO: Implement view scenario functionality
    console.log('View scenario:', scenario);
  }

  editScenario(scenario: Scenario): void {
    this.router.navigate(['/scenario', scenario.id]);
  }

  deleteScenario(scenario: Scenario): void {
    if (scenario.id) {
      this.scenarioService.deleteScenario(scenario.id).subscribe(() => {
        this.loadScenarios();
      });
    }
  }

  private loadScenarios(): void {
    this.scenarioService.getScenarios().subscribe({
      next: (scenarios) => {
        this.scenarios = scenarios;
      },
      error: (error) => {
        console.error('Error loading scenarios:', error);
      }
    });
  }
} 