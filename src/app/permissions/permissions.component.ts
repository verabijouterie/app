import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Permission } from '../interfaces/permission.interface';
import { PermissionGroup } from '../interfaces/permission-group.interface';
import { PermissionService } from '../services/permission.service';
import { PermissionGroupService } from '../services/permission-group.service';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    DrawerComponent,
    DragDropModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './permissions.component.html'
})
export class PermissionsComponent implements OnInit {
  permissions: Permission[] = [];
  permissionGroups: PermissionGroup[] = [];
  permissionForm: FormGroup;
  permissionGroupForm: FormGroup;
  editMode = false;
  selectedPermissionId: number | null = null;
  selectedPermissionGroupId: number | null = null;
  isPermissionDrawerOpen = false;
  isPermissionGroupDrawerOpen = false;
  skipDrawerAnimation = true;

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    private permissionGroupService: PermissionGroupService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.permissionForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/)]],
      permission_group_id: [null, Validators.required],
      row_index: [null, Validators.required]
    });

    this.permissionGroupForm = this.fb.group({
      name: ['', Validators.required],
      row_index: [null]
    });
  }

  ngOnInit(): void {
    this.loadPermissionGroups();
    this.loadPermissions();
    setTimeout(() => {
      this.skipDrawerAnimation = false;
    }, 100);
  }

  loadPermissionGroups(): void {
    this.permissionGroupService.getPermissionGroups().subscribe({
      next: (groups) => {
        // Sort groups by row_index
        this.permissionGroups = groups.sort((a, b) => (a.row_index || 0) - (b.row_index || 0));
      },
      error: (error) => this.snackBar.open('İzin grupları yüklenirken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      })
    });
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (permissions) => {
        // Sort permissions by row_index
        this.permissions = permissions.sort((a, b) => (a.row_index || 0) - (b.row_index || 0));
      },
      error: (error) => this.snackBar.open('İzinler yüklenirken bir hata oluştu', 'Kapat', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      })
    });
  }

  getPermissionsForGroup(groupId: number): Permission[] {
    return this.permissions
      .filter(p => p.permission_group_id === groupId)
      .sort((a, b) => (a.row_index || 0) - (b.row_index || 0));
  }

  openPermissionGroupDrawer(): void {
    this.isPermissionGroupDrawerOpen = true;
  }

  onPermissionGroupDrawerClose(): void {
    this.isPermissionGroupDrawerOpen = false;
    this.resetPermissionGroupForm();
  }

  openPermissionDrawer(groupId: number): void {
    this.selectedPermissionGroupId = groupId;
    const groupPermissions = this.getPermissionsForGroup(groupId);
    this.permissionForm.patchValue({ 
      permission_group_id: groupId,
      row_index: groupPermissions.length // Set initial row_index to the count of permissions in the group
    });
    this.isPermissionDrawerOpen = true;
  }

  onPermissionDrawerClose(): void {
    this.isPermissionDrawerOpen = false;
    this.resetPermissionForm();
  }

  editPermissionGroup(group: PermissionGroup): void {
    this.editMode = true;
    this.selectedPermissionGroupId = group.id;
    this.permissionGroupForm.patchValue({
      name: group.name,
      row_index: group.row_index
    });
    this.isPermissionGroupDrawerOpen = true;
  }

  deletePermissionGroup(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'İzin Grubunu Sil',
        message: 'Bu izin gruplarını silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.permissionGroups = this.permissionGroups.filter(group => group.id !== id);
        this.permissions = this.permissions.filter(permission => permission.permission_group_id !== id);

        this.permissionGroupService.deletePermissionGroup(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.loadPermissionGroups();
            this.loadPermissions();
            this.snackBar.open('İzin grubu silinirken bir hata oluştu', 'Kapat', {
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

  deletePermission(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'İzni Sil',
        message: 'Bu izni silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.permissions = this.permissions.filter(permission => permission.id !== id);
        
        this.permissionService.deletePermission(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.loadPermissions();
            this.snackBar.open('İzin silinirken bir hata oluştu', 'Kapat', {
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

  editPermission(permission: Permission): void {
    this.editMode = true;
    this.selectedPermissionId = permission.id;
    this.permissionForm.patchValue({
      name: permission.name,
      slug: permission.slug,
      permission_group_id: permission.permission_group_id,
      row_index: permission.row_index
    });
    this.openPermissionDrawer(permission.permission_group_id);
  }

  onPermissionGroupSubmit(): void {
    if (this.permissionGroupForm.valid) {
      const group: PermissionGroup = this.permissionGroupForm.value;
      
      if (this.editMode && this.selectedPermissionGroupId) {
        this.permissionGroupService.updatePermissionGroup(this.selectedPermissionGroupId, group).subscribe({
          next: () => {
            this.loadPermissionGroups();
            this.onPermissionGroupDrawerClose();
          },
          error: (error) => this.snackBar.open('İzin grubu güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      } else {
        // Set row_index to the current count of permission groups
        group.row_index = this.permissionGroups.length;
        
        this.permissionGroupService.createPermissionGroup(group).subscribe({
          next: () => {
            this.loadPermissionGroups();
            this.onPermissionGroupDrawerClose();
          },
          error: (error) => this.snackBar.open('İzin grubu oluşturulurken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      }
    }
  }

  onPermissionSubmit(): void {
    if (this.permissionForm.valid) {
      const permission: Permission = this.permissionForm.value;
      
      if (this.editMode && this.selectedPermissionId) {
        permission.id = this.selectedPermissionId;
        this.permissionService.updatePermission(this.selectedPermissionId, permission).subscribe({
          next: () => {
            this.loadPermissions();
            this.onPermissionDrawerClose();
          },
          error: (error) => this.snackBar.open('İzin güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      } else {
        this.permissionService.createPermission(permission).subscribe({
          next: () => {
            this.loadPermissions();
            this.onPermissionDrawerClose();
          },
          error: (error) => this.snackBar.open('İzin oluşturulurken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      }
    }
  }

  resetPermissionForm(): void {
    this.permissionForm.reset();
    this.editMode = false;
    this.selectedPermissionId = null;
    this.selectedPermissionGroupId = null;
  }

  resetPermissionGroupForm(): void {
    this.permissionGroupForm.reset();
    this.editMode = false;
    this.selectedPermissionGroupId = null;
  }

  dropGroup(event: CdkDragDrop<PermissionGroup[]>) {
    const groups = [...this.permissionGroups];
    const movedItem = groups[event.previousIndex];
    groups.splice(event.previousIndex, 1);
    groups.splice(event.currentIndex, 0, movedItem);
    
    // Update row_index for all groups
    groups.forEach((group, index) => {
      group.row_index = index;
      this.permissionGroupService.updatePermissionGroup(group.id, group).subscribe({
        error: (error) => this.snackBar.open('İzin grubu sıralaması güncellenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        })
      });
    });
    
    this.permissionGroups = groups;
  }

  dropPermission(event: CdkDragDrop<Permission[]>) {
    if (event.previousContainer === event.container) {
      // Same group reordering
      const permissions = [...event.container.data];
      const movedItem = permissions[event.previousIndex];
      permissions.splice(event.previousIndex, 1);
      permissions.splice(event.currentIndex, 0, movedItem);
      
      // Update row_index for all permissions in the group
      permissions.forEach((permission, index) => {
        permission.row_index = index;
        this.permissionService.updatePermission(permission.id!, permission).subscribe({
          error: (error) => this.snackBar.open('İzin sıralaması güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      });
    } else {
      // Moving between groups
      const previousPermissions = [...event.previousContainer.data];
      const currentPermissions = [...event.container.data];
      const movedItem = previousPermissions[event.previousIndex];
      
      // Remove from previous group
      previousPermissions.splice(event.previousIndex, 1);
      
      // Update row_index for remaining permissions in previous group
      previousPermissions.forEach((permission, index) => {
        permission.row_index = index;
        this.permissionService.updatePermission(permission.id!, permission).subscribe({
          error: (error) => this.snackBar.open('İzin sıralaması güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      });
      
      // Add to new group
      currentPermissions.splice(event.currentIndex, 0, movedItem);
      
      // Update row_index and permission_group_id for all permissions in new group
      currentPermissions.forEach((permission, index) => {
        permission.row_index = index;
        permission.permission_group_id = parseInt(event.container.id);
        this.permissionService.updatePermission(permission.id!, permission).subscribe({
          error: (error) => this.snackBar.open('İzin sıralaması güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          })
        });
      });
    }
    
    // Update the permissions array
    this.permissions = this.permissions.map(p => {
      const updatedPermission = [...event.previousContainer.data, ...event.container.data]
        .find(perm => perm.id === p.id);
      return updatedPermission || p;
    });
  }
} 