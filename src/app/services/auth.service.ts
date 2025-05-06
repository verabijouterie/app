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
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/login.php`,
      credentials,
      { withCredentials: true } // ✅ Required to accept cookie from API
    ).pipe(
      tap(response => {
        this.setAuthData(response);
        this.startRefreshTimer();
      })
    );
  }


  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token); // ✅ Access token only
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private startRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const token = this.token;
    if (token) {
      try {
        const tokenData = this.parseJwt(token);
        const expiresIn = tokenData.exp * 1000 - Date.now() - 5 * 60 * 1000;

        if (expiresIn > 0) {
          this.refreshTimer = setTimeout(() => this.refreshToken().subscribe(), expiresIn);
        }
      } catch (error) {
        console.warn('Failed to start refresh timer:', error);
        this.logout(); // optional: handle invalid token case
      }
    }
  }

  private parseJwt(token: string): any {
    if (!token || token.split('.').length !== 3) {
      throw new Error('Invalid JWT token');
    }

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.apiUrl}/auth/refresh-token.php`,
      {}, // no body needed
      { withCredentials: true } // ⬅️ important: send cookies
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.startRefreshTimer();
      })
    );
  }

  logout(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    this.http.post(`${environment.apiUrl}/auth/logout.php`, {}, { withCredentials: true }).subscribe();

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