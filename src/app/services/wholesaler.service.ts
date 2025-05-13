import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Wholesaler } from '../interfaces/wholesaler.interface';
import { Role } from '../interfaces/role.interface';

@Injectable({
  providedIn: 'root'
})
export class WholesalerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getWholesalers(): Observable<Wholesaler[]> {
    return this.http.get<Wholesaler[]>(`${this.apiUrl}/wholesalers`);
  }

  getWholesaler(id: number): Observable<Wholesaler> {
    return this.http.get<Wholesaler>(`${this.apiUrl}/wholesalers/${id}`);
  }

  createWholesaler(wholesaler: Wholesaler): Observable<Wholesaler> {
    return this.http.post<Wholesaler>(`${this.apiUrl}/wholesalers`, wholesaler);
  }

  updateWholesaler(id: number, wholesaler: Wholesaler): Observable<Wholesaler> {
    return this.http.put<Wholesaler>(`${this.apiUrl}/wholesalers/${id}`, wholesaler);
  }

  deleteWholesaler(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/wholesalers/${id}`);
  }
} 