import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Role } from '../interfaces/role.interface';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './role-list.component.html'
})
export class RoleListComponent {
  @Input() roles: Role[] = [];
  @Output() edit = new EventEmitter<Role>();
  @Output() delete = new EventEmitter<number>();
} 