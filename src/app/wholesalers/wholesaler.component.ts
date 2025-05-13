import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Wholesaler } from '../interfaces/wholesaler.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-wholesaler',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './wholesaler.component.html'
})
export class WholesalerComponent implements OnInit, OnChanges {
  @Input() wholesaler?: Wholesaler;
  @Input() isOpen = false;
  @Input() isAnimationComplete = false;
  @Output() wholesalerSubmit = new EventEmitter<Wholesaler>();
  @Output() cancel = new EventEmitter<void>();

  formData: Partial<Wholesaler> = {
    name: '',
    prefers_gold: false,
    starting_gold_balance: 0,
    starting_euro_balance: 0,
    total_gold_balance: 0,
    total_euro_balance: 0
  };
  editMode = false;

  constructor(
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wholesaler'] && this.wholesaler) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.wholesaler) {
      this.editMode = true;
      this.formData = {
        ...this.wholesaler,
        prefers_gold: Boolean(this.wholesaler.prefers_gold)
      };
    } else {
      this.editMode = false;
      this.formData = {
        name: '',
        prefers_gold: false,
        starting_gold_balance: 0,
        starting_euro_balance: 0,
        total_gold_balance: 0,
        total_euro_balance: 0
      };
    }
  }

  getTotalGoldBalance(): number {
    const totalGold = Number(this.formData.total_gold_balance) || 0;
    const startingGold = Number(this.formData.starting_gold_balance) || 0;
    return totalGold + startingGold;
  }

  getTotalEuroBalance(): number {
    const totalEuro = Number(this.formData.total_euro_balance) || 0;
    const startingEuro = Number(this.formData.starting_euro_balance) || 0;
    return totalEuro + startingEuro;
  }

  onSubmit(): void {
    if (this.formData.name) {
      const wholesaler: Wholesaler = {
        ...this.formData,
        id: this.wholesaler?.id || 0,
        starting_gold_balance: Number(this.formData.starting_gold_balance) || 0,
        starting_euro_balance: Number(this.formData.starting_euro_balance) || 0,
        total_gold_balance: Number(this.formData.total_gold_balance) || 0,
        total_euro_balance: Number(this.formData.total_euro_balance) || 0
      } as Wholesaler;
      this.wholesalerSubmit.emit(wholesaler);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 