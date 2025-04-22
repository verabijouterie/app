import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Permission } from '../interfaces/permission.interface';
import { PermissionGroup } from '../interfaces/permission-group.interface';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './permission-list.component.html'
})
export class PermissionListComponent {
  @Input() permissions: Permission[] = [];
  @Input() permissionGroups: PermissionGroup[] = [];
  @Output() edit = new EventEmitter<Permission>();
  @Output() delete = new EventEmitter<number>();

  getGroupName(groupId: number): string {
    const group = this.permissionGroups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  }

  onDelete(id: number) {
    this.delete.emit(id);
  }

} 