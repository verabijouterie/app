import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Scenario } from '../interfaces/scenario.interface';
import { ScenarioService } from '../services/scenario.service';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-scenario-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    DatePipe,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent implements OnInit {
  scenarios: Scenario[] = [];
  pageSize = 10;
  currentPage = 1;
  loading = false;
  allLoaded = false;
  totalScenarios = 0;

  displayedColumns: string[] = [
    'actions',
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
    'totalBankOut'
  ];

  constructor(
    private scenarioService: ScenarioService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadScenarios();
  }

  loadScenarios() {
    if (this.loading || this.allLoaded) return;

    this.loading = true;

    this.scenarioService.getScenarios(this.currentPage, this.pageSize).subscribe({
      next: (scenarios) => {
        this.totalScenarios+= scenarios.length;
        this.allLoaded = scenarios.length < this.pageSize;
        
        this.scenarios = [...this.scenarios, ...scenarios];
        this.currentPage++;
        this.loading = false;
        

      },
      error: (error) => {
        console.error('Error loading scenarios:', error);
        this.loading = false;
      }
    });
  }

  loadMore() {
    this.loadScenarios();
  }

  deleteScenario(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Alışverişi Sil',
        message: 'Bu alışverişi silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistically remove the scenario from the local array
        this.scenarios = this.scenarios.filter(scenario => scenario.id !== id);
        
        this.scenarioService.deleteScenario(id).subscribe({
          next: () => {
            // Success - no need to reload since we already updated the UI
          },
          error: (error) => {
            this.loadScenarios();
            this.snackBar.open('Alışveriş silinirken bir hata oluştu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  createNewScenario() {
    this.router.navigate(['/scenarios/new']);
  }



} 
