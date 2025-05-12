import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SupplyService } from '../services/supply.service';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Supply } from '../interfaces/supply.interface';
@Component({
  selector: 'app-supply-list',
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
  templateUrl: './supply-list.component.html',
  styleUrls: ['./supply-list.component.scss']
})
export class SupplyListComponent implements OnInit {
  supplies: Supply[] = [];
  pageSize = 10;
  currentPage = 1;
  loading = false;
  allLoaded = false;
  totalSupplies = 0;

  displayedColumns: string[] = [
    'actions',
    'date',
    'wholesaler_name',
    'agreedTotalInAs24K',
    'agreedTotalOutAs24K',
    'agreedTotalAs24K',
    'agreedTotalInAsMoney',
    'agreedTotalOutAsMoney',
    'agreedTotalAsMoney'
  ];

  constructor(
    private supplyService: SupplyService,
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

    this.supplyService.getSupplies(this.currentPage, this.pageSize).subscribe({
      next: (supplies) => {
        this.totalSupplies += supplies.length;
        this.allLoaded = supplies.length < this.pageSize;
        
        this.supplies = [...this.supplies, ...supplies];
        this.currentPage++;
        this.loading = false;
        

      },
      error: (error) => {
        this.snackBar.open('Toptan Alışverişler yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  loadMore() {
    this.loadScenarios();
  }

  deleteSupply(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Toptan Alışverişi Sil',
        message: 'Bu toptan alışverişini silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistically remove the supply from the local array
        this.supplies = this.supplies.filter(supply => supply.id !== id);
        
        this.supplyService.deleteSupply(id).subscribe({
          next: () => {
            // Success - no need to reload since we already updated the UI
          },
          error: (error) => {
            this.loadScenarios();
            this.snackBar.open('Toptan Alışveriş silinirken bir hata oluştu', 'Kapat', {
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

  createNewSupply() {
    this.router.navigate(['/supplies/new']);
  }



} 
