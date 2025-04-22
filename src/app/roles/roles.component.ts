import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Role } from '../interfaces/role.interface';
import { RoleListComponent } from './role-list.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { RoleService } from '../services/roles.services';
import { PermissionGroup } from '../interfaces/permission-group.interface';
import { Permission } from '../interfaces/permission.interface';
import { PermissionGroupService } from '../services/permission-group.service';
import { PermissionService } from '../services/permission.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatCheckboxModule,
    RoleListComponent,
    DrawerComponent,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  permissionGroups: PermissionGroup[] = [];
  permissions: Permission[] = [];
  roleForm: FormGroup;
  editMode = false;
  selectedRoleId: number | null = null;
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  selectedPermissions: Set<number> = new Set();

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionGroupService: PermissionGroupService,
    private permissionService: PermissionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissionGroups();
    this.loadPermissions();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        // If we're in edit mode, refresh the selected permissions
        if (this.editMode && this.selectedRoleId) {
          const currentRole = roles.find(r => r.id === this.selectedRoleId);
          if (currentRole) {
            this.selectedPermissions = new Set(currentRole.permission_ids || []);
          }
        }
      },
      error: (error) => console.error('Error loading roles:', error)
    });
  }

  loadPermissionGroups(): void {
    this.permissionGroupService.getPermissionGroups().subscribe({
      next: (groups) => {
        this.permissionGroups = groups.sort((a, b) => (a.row_index || 0) - (b.row_index || 0));
      },
      error: (error) => console.error('Error loading permission groups:', error)
    });
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions.sort((a, b) => (a.row_index || 0) - (b.row_index || 0));
      },
      error: (error) => console.error('Error loading permissions:', error)
    });
  }

  getPermissionsForGroup(groupId: number): Permission[] {
    return this.permissions
      .filter(p => p.permission_group_id === groupId)
      .sort((a, b) => (a.row_index || 0) - (b.row_index || 0));
  }

  openRoleDrawer(): void {
    if (!this.editMode) {
      // Only clear permissions when creating a new role
      this.selectedPermissions.clear();
    }
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.resetForm();
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      const role: Role = {
        ...this.roleForm.value,
        permission_ids: Array.from(this.selectedPermissions)
      };
      
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
    const permissionIds = (role.permission_ids || [])
      .map(id => Number(id))
      .filter(id => !isNaN(id));
    this.selectedPermissions = new Set(permissionIds);
    this.openRoleDrawer();
  }

  deleteRole(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Rolü Sil',
        message: 'Bu rolü silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roles = this.roles.filter(role => role.id !== id);
        
        this.roleService.deleteRole(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.loadRoles();
            this.snackBar.open('Rol silinirken bir hata oluştu', 'Kapat', {
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

  resetForm(): void {
    this.roleForm.reset();
    this.selectedPermissions.clear();
    this.editMode = false;
    this.selectedRoleId = null;
  }

  togglePermission(permissionId: number | undefined): void {
    if (permissionId === undefined) return;
    const numericId = Number(permissionId);
    if (isNaN(numericId)) return;
    
    if (this.selectedPermissions.has(numericId)) {
      this.selectedPermissions.delete(numericId);
    } else {
      this.selectedPermissions.add(numericId);
    }
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.selectedPermissions.has(Number(permissionId));
  }

  getPermissionIdType(id: any): string {
    return `${typeof id} (${id})`;
  }

  checkPermission(id: number | undefined): boolean {
    if (id === undefined) return false;
    console.log(`Checking permission ${id} (${typeof id}), Set has:`, Array.from(this.selectedPermissions));
    const result = this.selectedPermissions.has(id);
    console.log(`Result for ${id}: ${result}`);
    return result;
  }
} 