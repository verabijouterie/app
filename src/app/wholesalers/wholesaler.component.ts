import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WholesalerListComponent } from './wholesaler-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { WholesalerService } from '../services/wholesaler.service';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Wholesaler } from '../interfaces/wholesaler.interface';

@Component({
  selector: 'app-wholesalers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    WholesalerListComponent,
    DrawerComponent,
    MatSnackBarModule
  ],
  templateUrl: './wholesaler.component.html'
})
export class WholesalersComponent implements OnInit {
  wholesalers: Wholesaler[] = [];
  wholesalerForm: FormGroup;
  editMode = false;
  selectedWholesalerId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private wholesalerService: WholesalerService
  ) {
    this.wholesalerForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadWholesalers();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadWholesalers(): void {
    this.wholesalerService.getWholesalers().subscribe({
      next: (wholesalers) => {
        this.wholesalers = wholesalers;
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


  openWholesalerDrawer(): void {
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.wholesalerForm.reset();
    this.editMode = false;
    this.selectedWholesalerId = null;
  }

  onSubmit(): void {
    if (this.wholesalerForm.valid) {
      const formValue = this.wholesalerForm.value;
      const wholesaler: Wholesaler = {
        ...formValue,
      };

      if (this.editMode && this.selectedWholesalerId) {
        this.wholesalerService.updateWholesaler(this.selectedWholesalerId, wholesaler).subscribe({
          next: () => {
            this.loadWholesalers();
            this.onDrawerClose();
          },
          error: (error) => {
            this.loadWholesalers();
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
          next: () => {
            this.loadWholesalers();
            this.onDrawerClose();
          },
          error: (error) => {
            this.loadWholesalers();
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
  }

  editWholesaler(wholesaler: Wholesaler): void {
    this.editMode = true;
    this.selectedWholesalerId = wholesaler.id;
    this.wholesalerForm.patchValue({
      name: wholesaler.name,
    });
    this.openWholesalerDrawer();
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
            this.loadWholesalers();
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