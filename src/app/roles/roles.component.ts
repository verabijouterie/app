import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Role } from '../interfaces/role.interface';
import { RoleListComponent } from './role-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { RoleService } from '../services/roles.services';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RoleListComponent,
    DrawerComponent
  ],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  roleForm: FormGroup;
  editMode = false;
  selectedRoleId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: (error) => console.error('Error loading roles:', error)
    });
  }

  openRoleDrawer(): void {
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const role: Role = this.roleForm.value;
      
      if (this.editMode && this.selectedRoleId) {
        this.roleService.updateRole(this.selectedRoleId, role).subscribe({
          next: () => {
            this.loadRoles();
            this.onDrawerClose();
          },
          error: (error) => console.error('Error updating role:', error)
        });
      } else {
        this.roleService.createRole(role).subscribe({
          next: () => {
            this.loadRoles();
            this.onDrawerClose();
          },
          error: (error) => console.error('Error creating role:', error)
        });
      }
    }
  }

  editRole(role: Role): void {
    this.editMode = true;
    this.selectedRoleId = role.id ?? null;
    this.roleForm.patchValue({
      name: role.name
    });
    this.openRoleDrawer();
  }

  deleteRole(id: number): void {
    this.roleService.deleteRole(id).subscribe({
      next: () => this.loadRoles(),
      error: (error) => console.error('Error deleting role:', error)
    });
  }

  resetForm(): void {
    this.roleForm.reset();
    this.editMode = false;
    this.selectedRoleId = null;
  }
} 