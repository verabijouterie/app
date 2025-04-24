import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supply } from '../interfaces/supply.interface';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SupplyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getSupplies(page: number = 1, pageSize: number = 10): Observable<Supply[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<Supply[]>(`${this.apiUrl}/supplies`, { params });
  }

  getSupply(id: number): Observable<Supply> {
    return this.http.get<Supply>(`${this.apiUrl}/supplies/${id}`);
  }

  createSupply(supply: Supply): Observable<Supply> {
    return this.http.post<Supply>(`${this.apiUrl}/supplies`, supply);
  }

  updateSupply(id: number, supply: Supply): Observable<Supply> {
    return this.http.put<Supply>(`${this.apiUrl}/supplies/${id}`, supply);
  }

  deleteSupply(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/supplies/${id}`);
  }
} 