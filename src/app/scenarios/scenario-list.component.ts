import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Scenario } from '../interfaces/scenario.interface';
import { ScenarioService } from '../services/scenario.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-scenario-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    DatePipe,
    RouterModule
  ],
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent implements OnInit {
  scenarios: Scenario[] = [];
  displayedColumns: string[] = [
    'date',
    'description',
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
    'actions'
  ];

  constructor(
    private scenarioService: ScenarioService,
    private router: Router
    
  ) {}

  ngOnInit() {
    this.loadScenarios();
  }

  loadScenarios() {
    this.scenarioService.getScenarios().subscribe({
      next: (scenarios) => {
        this.scenarios = scenarios;
      },
      error: (error) => {
        console.error('Error loading scenarios:', error);
      }
    });
  }


  deleteScenario(id: number) {
    if (confirm('Are you sure you want to delete this scenario?')) {
      // Optimistically remove the scenario from the local array
      this.scenarios = this.scenarios.filter(scenario => scenario.id !== id);
      
      this.scenarioService.deleteScenario(id).subscribe({
        next: () => {
          // Success - no need to reload since we already updated the UI
        },
        error: (error) => {
          console.error('Error deleting scenario:', error);
          // On error, reload the scenarios to ensure consistency
          this.loadScenarios();
        }
      });
    }
  }

  createNewScenario() {
    this.router.navigate(['/scenarios/new']);
  }
} 