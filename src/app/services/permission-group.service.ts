import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PermissionGroup } from '../interfaces/permission-group.interface';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPermissionGroups(): Observable<PermissionGroup[]> {
    return this.http.get<PermissionGroup[]>(`${this.apiUrl}/permission-groups`);
  }

  getPermissionGroup(id: number): Observable<PermissionGroup> {
    return this.http.get<PermissionGroup>(`${this.apiUrl}/permission-groups/${id}`);
  }

  createPermissionGroup(permissionGroup: PermissionGroup): Observable<PermissionGroup> {
    return this.http.post<PermissionGroup>(`${this.apiUrl}/permission-groups`, permissionGroup);
  }

  updatePermissionGroup(id: number, permissionGroup: PermissionGroup): Observable<PermissionGroup> {
    return this.http.put<PermissionGroup>(`${this.apiUrl}/permission-groups/${id}`, permissionGroup);
  }

  deletePermissionGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permission-groups/${id}`);
  }
} 