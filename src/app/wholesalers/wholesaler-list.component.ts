import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Wholesaler } from '../interfaces/wholesaler.interface';
import { WholesalerService } from '../services/wholesaler.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { WholesalerComponent } from './wholesaler.component';

@Component({
  selector: 'app-wholesaler-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    DrawerComponent,
    WholesalerComponent
  ],
  templateUrl: './wholesaler-list.component.html'
})
export class WholesalerListComponent implements OnInit {
  @ViewChild(WholesalerComponent) wholesalerComponent!: WholesalerComponent;

  wholesalers: Wholesaler[] = [];
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  editMode = false;
  selectedWholesaler: Wholesaler | undefined;

  displayedColumns: string[] = [
    'actions',
    'name',
    'prefers_gold',
    'starting_gold_balance',
    'starting_euro_balance',
    'total_gold_balance',
    'total_euro_balance'
  ];

  constructor(
    private wholesalerService: WholesalerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWholesalers();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadWholesalers(): void {

    this.wholesalerService.getWholesalers().subscribe({
      next: (wholesalers) => {
        
        this.wholesalers = [...this.wholesalers, ...wholesalers.map(wholesaler => ({
          ...wholesaler,
          prefers_gold: Boolean(wholesaler.prefers_gold)
        }))];
      },
      error: (error) => {
        this.snackBar.open('Toptan satıcılar yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadMore(): void {
    this.loadWholesalers();
  }

  openWholesalerDrawer(): void {
    this.editMode = false;
    this.selectedWholesaler = undefined;
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.selectedWholesaler = undefined;
  }

  editWholesaler(wholesaler: Wholesaler): void {
    this.editMode = true;
    this.selectedWholesaler = wholesaler;
    this.isDrawerOpen = true;
  }

  onWholesalerSubmit(wholesaler: Wholesaler): void {
    if (this.editMode) {
      this.wholesalerService.updateWholesaler(wholesaler.id!, wholesaler).subscribe({
        next: () => {
          this.wholesalers = this.wholesalers.map(w => w.id === wholesaler.id ? wholesaler : w);
          this.onDrawerClose();
        },
        error: (error) => {
          this.snackBar.open('Toptan satıcı güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.wholesalerService.createWholesaler(wholesaler).subscribe({
        next: (createdWholesaler) => {
          this.wholesalers = [createdWholesaler, ...this.wholesalers];
          this.onDrawerClose();
        },
        error: (error) => {
          this.snackBar.open('Toptan satıcı oluşturulurken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteWholesaler(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Toptan Satıcıyı Sil',
        message: 'Bu toptan satıcıyı silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.wholesalers = this.wholesalers.filter(wholesaler => wholesaler.id !== id);

        this.wholesalerService.deleteWholesaler(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.snackBar.open('Toptan satıcı silinirken bir hata oluştu', 'Kapat', {
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
} 