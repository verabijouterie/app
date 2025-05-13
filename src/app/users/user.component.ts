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
import { User } from '../interfaces/user.interface';
import { Role } from '../interfaces/role.interface';

@Component({
  selector: 'app-user',
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
    MatSnackBarModule,
  ],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnChanges {
  @Input() user?: User;
  @Input() roles: Role[] = [];
  @Input() isOpen = false;
  @Input() isAnimationComplete = false;
  @Output() userSubmit = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  formData: Partial<User> = {
    name: '',
    email: '',
    role_id: undefined,
    password: ''
  };
  editMode = false;

  constructor(
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.user) {
      this.editMode = true;
      this.formData = {
        ...this.user,
        password: ''
      };
    } else {
      this.editMode = false;
      this.formData = {
        name: '',
        email: '',
        role_id: undefined,
        password: ''
      };
    }
  }

  onSubmit(): void {
    if (this.formData.name && this.formData.email && this.formData.role_id) {
      const user: User = {
        ...this.formData,
        id: this.user?.id || 0
      } as User;
      this.userSubmit.emit(user);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
} 