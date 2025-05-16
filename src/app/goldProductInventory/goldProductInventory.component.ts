import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-gold-product-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTableModule
  ],
  templateUrl: './goldProductInventory.component.html',
  styleUrls: ['./goldProductInventory.component.scss']
})
export class GoldProductInventoryComponent implements OnInit {
  goldProductInventory: any[] = [];
  displayedColumns: string[] = [
    'category_name',
    'product_name',
    'qty_24',
    'weight_24',
    'qty_22',
    'weight_22',
    'qty_21',
    'weight_21',
    'qty_20',
    'weight_20',
    'qty_18',
    'weight_18',
    'qty_14',
    'weight_14',
    'qty_9',
    'weight_9',
    'qty_8',
    'weight_8',
    'total_quantity',
    'total_weight24k'
  ];

  constructor(
    private helperService: HelperService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadGoldProductInventory();
  }

  loadGoldProductInventory(): void {
    this.helperService.getGoldProductInventory('productInventory').subscribe({
      next: (goldProductInventory) => {
        this.goldProductInventory = goldProductInventory;
      },
      error: (error) => {
        this.snackBar.open('Stok yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
} 