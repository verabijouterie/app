import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Transaction } from '../interfaces/transaction.interface';
import { TransactionComponent } from './transaction.component';

@Component({
    selector: 'app-transaction-dialog',
    template: `
    <h2 mat-dialog-title>{{ data.transaction ? 'Edit Transaction' : 'Add Transaction' }}</h2>
    <mat-dialog-content>
      <app-transaction 
        [transaction]="data.transaction"
        [type]="data.type || 'Product'"
        [direction]="data.direction || 'In'"
        (transactionSubmit)="onTransactionSubmit($event)">
      </app-transaction>
    </mat-dialog-content>
  `,
    imports: [TransactionComponent, MatDialogModule]
})
export class TransactionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      transaction?: Transaction;
      type?: 'Product' | 'Scrap' | 'Cash' | 'Bank';
      direction?: 'In' | 'Out';
    }
  ) {}

  onTransactionSubmit(transaction: Transaction) {
    this.dialogRef.close(transaction);
  }
} 