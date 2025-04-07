import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { mockScenarios } from '../mockup/mock-scenarios';
import { Scenario } from '../interfaces/scenario.interface';

@Component({
  selector: 'app-scenario-list',
  standalone: true,
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
  scenarios: Scenario[] = mockScenarios;
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
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to route changes to refresh the list when returning from edit
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.refreshScenarios();
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
    const index = mockScenarios.findIndex(s => s.id === scenario.id);
    if (index !== -1) {
      mockScenarios.splice(index, 1);
      // Refresh the scenarios array to trigger change detection
      this.scenarios = [...mockScenarios];
    }
  }

  // Add a method to refresh the scenarios list
  refreshScenarios(): void {
    this.scenarios = [...mockScenarios];
  }
} 