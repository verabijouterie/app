import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Order } from '../interfaces/order.interface';
import { OrderService } from '../services/order.service';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-list',
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
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  pageSize = 10;
  currentPage = 1;
  loading = false;
  allLoaded = false;
  totalOrders = 0;

  displayedColumns: string[] = [
    'actions',
    'id',
    'client_name',
    'date_planned',
    'date_fulfilled',
    'total_order_amount',
    'total24kOut',
    'totalPaymentIn',
    'remaining_amount',
    'status'
  ];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    if (this.loading || this.allLoaded) return;

    this.loading = true;

    this.orderService.getOrders(this.currentPage, this.pageSize).subscribe({
      next: (orders) => {
        this.totalOrders+= orders.length;
        this.allLoaded = orders.length < this.pageSize;
        
        this.orders = [...this.orders, ...orders];
        this.currentPage++;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Siparişler yüklenirken bir hata oluştu', 'Kapat', {
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
    this.loadOrders();
  }

  getStatusTranslation(status: string | null | undefined): string {
    if (!status) return '';
    
    const statusMap: Record<string, string> = {
      'ToBeOrdered': 'Sipariş Edilecek',
      'AwaitingWholesaler': 'Toptancı Bekleniyor',
      'AwaitingCustomer': 'Müşteri Bekleniyor',
      'HandedOut': 'Teslim Edildi',
      'Completed': 'Tamamlandı'
    };
    
    return statusMap[status] || status;
  }

  deleteOrder(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Siparişi Sil',
        message: 'Bu siparişi silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistically remove the order from the local array
        this.orders = this.orders.filter(order => order.id !== id);
        
        this.orderService.deleteOrder(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.loadOrders();
            this.snackBar.open('Sipariş silinirken bir hata oluştu', 'Kapat', {
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

  createNewOrder() {
    this.router.navigate(['/orders/new']);
  }
} 