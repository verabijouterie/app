import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../interfaces/user.interface';
import { Role } from '../interfaces/role.interface';
import { UserListComponent } from './user-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/roles.services';

@Component({
  selector: 'app-users',
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
    UserListComponent,
    DrawerComponent
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  userForm: FormGroup;
  editMode = false;
  selectedUserId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role_id: [null, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => console.error('Error loading roles:', error)
    });
  }

  openUserDrawer(): void {
    if (!this.editMode) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.userForm.reset();
    this.editMode = false;
    this.selectedUserId = null;
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const user: User = {
        ...formValue,
        ...(formValue.password ? { password: formValue.password } : {})
      };
      
      if (this.editMode && this.selectedUserId) {
        this.userService.updateUser(this.selectedUserId, user).subscribe({
          next: () => {
            this.loadUsers();
            this.onDrawerClose();
          },
          error: (error) => console.error('Error updating user:', error)
        });
      } else {
        this.userService.createUser(user).subscribe({
          next: () => {
            this.loadUsers();
            this.onDrawerClose();
          },
          error: (error) => console.error('Error creating user:', error)
        });
      }
    }
  }

  editUser(user: User): void {
    this.editMode = true;
    this.selectedUserId = user.id;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      password: ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.openUserDrawer();
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (error) => console.error('Error deleting user:', error)
    });
  }
} 