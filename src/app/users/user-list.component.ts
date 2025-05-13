import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../interfaces/user.interface';
import { Role } from '../interfaces/role.interface';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/roles.services';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/confirmation-dialog/confirmation-dialog.component';
import { DrawerComponent } from '../shared/drawer/drawer.component';
import { UserComponent } from './user.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    DrawerComponent,
    UserComponent
  ],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  @ViewChild(UserComponent) userComponent!: UserComponent;

  users: User[] = [];
  roles: Role[] = [];
  isDrawerOpen = false;
  skipDrawerAnimation = true;
  editMode = false;
  selectedUser: User | undefined;

  displayedColumns: string[] = [
    'actions',
    'name',
    'email',
    'role'
  ];

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

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
      error: (error) => {
        this.snackBar.open('Kullanıcılar yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        this.snackBar.open('Roller yüklenirken bir hata oluştu', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getRoleName(roleId: number | undefined): string {
    if (!roleId) return 'No Role';
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  }

  openUserDrawer(): void {
    this.editMode = false;
    this.selectedUser = undefined;
    this.isDrawerOpen = true;
  }

  onDrawerClose(): void {
    this.isDrawerOpen = false;
    this.selectedUser = undefined;
  }

  editUser(user: User): void {
    this.editMode = true;
    this.selectedUser = user;
    this.isDrawerOpen = true;
  }

  onUserSubmit(user: User): void {
    if (this.editMode) {
      this.userService.updateUser(user.id, user).subscribe({
        next: () => {
          this.users = this.users.map(u => u.id === user.id ? user : u);
          this.onDrawerClose();
        },
        error: (error) => {
          this.snackBar.open('Kullanıcı güncellenirken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.userService.createUser(user).subscribe({
        next: (createdUser) => {
          this.users = [createdUser, ...this.users];
          this.onDrawerClose();
        },
        error: (error) => {
          this.snackBar.open('Kullanıcı oluşturulurken bir hata oluştu', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteUser(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Kullanıcıyı Sil',
        message: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.users = this.users.filter(user => user.id !== id);

        this.userService.deleteUser(id).subscribe({
          next: () => {
          },
          error: (error) => {
            this.snackBar.open('Kullanıcı silinirken bir hata oluştu', 'Kapat', {
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
} 