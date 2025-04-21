import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Order } from '../interfaces/order.interface';
import { OrderService } from '../services/order.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-list',
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
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  displayedColumns: string[] = [
    'actions',
    'date_planned',
    'date_fulfilled',
    'description',
    'total24kProductOut',
    'total24kOut',
    'totalCashIn',
    'totalBankIn'
  ];

  constructor(
    private orderService: OrderService,
    private router: Router
    
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


  deleteOrder(id: number) {
    if (confirm('Are you sure you want to delete this order?')) {
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
  }

  createNewOrder() {
    this.router.navigate(['/orders/new']);
  }
} 