import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GoldRate } from '../interfaces/gold-rate';

@Injectable({
  providedIn: 'root'
})
export class GoldRateService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getGoldRates(fromDate?: string, toDate?: string): Observable<GoldRate[] | GoldRate> {
    let url = `${this.apiUrl}/gold-rates`;
  
    if (fromDate && toDate) {
      url += `/${fromDate}/${toDate}`;
    } else if (fromDate) {
      url += `/${fromDate}`;
    }
  
    return this.http.get<GoldRate[] | GoldRate>(url);
  }

} 