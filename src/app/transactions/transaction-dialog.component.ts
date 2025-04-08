import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Transaction } from '../interfaces/transaction.interface';
import { TransactionComponent } from './transaction.component';

@Component({
    selector: 'app-transaction-dialog',
    template: `
    <div class="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5">
      <div class="px-6 py-4 border-b border-gray-900/10">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ data.transaction ? 'Edit Transaction' : 'Add Transaction' }}
        </h2>
      </div>
      <div class="px-6 py-4">
        <app-transaction 
          [transaction]="data.transaction"
          [type]="data.type || 'Product'"
          [direction]="data.direction || 'In'"
          (transactionSubmit)="onTransactionSubmit($event)"
          (cancel)="onCancel()">
        </app-transaction>
      </div>
    </div>
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

  onCancel() {
    this.dialogRef.close();
  }
} 