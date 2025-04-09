import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, timer } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
  };
}

export interface RefreshTokenResponse {
  token: string;
}

export interface ApiError {
  message: string;
  status: number;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthResponse['user'] | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private refreshTimer: any;

  constructor(private http: HttpClient) {
    // Check for stored token and user data on service initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.startRefreshTimer();
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login.php`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          this.startRefreshTimer();
        })
      );
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private startRefreshTimer(): void {
    // Clear any existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Set timer to refresh token 5 minutes before it expires
    const token = this.token;
    if (token) {
      const tokenData = this.parseJwt(token);
      const expiresIn = tokenData.exp * 1000 - Date.now() - 5 * 60 * 1000; // 5 minutes before expiry
      
      if (expiresIn > 0) {
        this.refreshTimer = setTimeout(() => this.refreshToken(), expiresIn);
      }
    }
  }

  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${environment.apiUrl}/auth/refresh-token.php`, {})
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.startRefreshTimer();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get currentUser(): AuthResponse['user'] | null {
    return this.currentUserSubject.value;
  }
} 