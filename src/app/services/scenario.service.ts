import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scenario } from '../interfaces/scenario.interface';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getScenarios(): Observable<Scenario[]> {
    return this.http.get<Scenario[]>(`${this.apiUrl}/scenarios`);
  }

  getScenario(id: number): Observable<Scenario> {
    return this.http.get<Scenario>(`${this.apiUrl}/scenarios/${id}`);
  }

  createScenario(scenario: Scenario): Observable<Scenario> {
    return this.http.post<Scenario>(`${this.apiUrl}/scenarios`, scenario);
  }

  updateScenario(id: number, scenario: Scenario): Observable<Scenario> {
    return this.http.put<Scenario>(`${this.apiUrl}/scenarios/${id}`, scenario);
  }

  deleteScenario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/scenarios/${id}`);
  }
} 