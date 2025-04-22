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
    RouterModule
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
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
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
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
            // Success - no need to reload since we already updated the UI
          },
          error: (error) => {
            console.error('Error deleting order:', error);
            // On error, reload the orders to ensure consistency
            this.loadOrders();
          }
        });
      }
    });
  }

  createNewOrder() {
    this.router.navigate(['/orders/new']);
  }
} 