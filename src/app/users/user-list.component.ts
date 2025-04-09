import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../interfaces/user.interface';
import { Role } from '../interfaces/role.interface';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  @Input() users: User[] = [];
  @Input() roles: Role[] = [];
  @Output() edit = new EventEmitter<User>();
  @Output() delete = new EventEmitter<number>();

  getRoleName(roleId: number | undefined): string {
    if (!roleId) return 'No Role';
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  }
} 