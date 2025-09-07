// Here we are implementing the AuthService to handle user authentication, including login, registration, logout, and profile updates.
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/Auth`;
  private userSub = new BehaviorSubject<User | null>(null);
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('dc_user');
    if (raw) this.userSub.next(JSON.parse(raw));
  }

  // ---- auth core ----
  login(dto: LoginDto) {
    return this.http.post<AuthResponse>(`${this.api}/login`, dto).pipe(
      tap(res => {
        localStorage.setItem('dc_token', res.token);
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        this.userSub.next(res.user);
      })
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<AuthResponse>(`${this.api}/register`, dto).pipe(
      tap(res => {
        localStorage.setItem('dc_token', res.token);
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        this.userSub.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('dc_token');
    localStorage.removeItem('dc_user');
    this.userSub.next(null);
  }

  // ---- helpers ----
  getToken(): string | null { return localStorage.getItem('dc_token'); }
  getUser(): User | null { return this.userSub.value; }
  isLoggedIn(): boolean { return !!this.getToken(); }

  // ---- profile: update current user ----
  /*
    Update the logged-in user's profile.
   Backend endpoint: PUT {apiBase}/users/me
   */
  updateMyProfile(payload: {
    username: string;
    email: string;
    currentPassword?: string | null;
    newPassword?: string | null;
  }) {
    const url = `${environment.apiUrl}/users/me`;
    return this.http.put<{ message: string; user: User }>(url, payload).pipe(
      tap(res => {
        // persist new user data locally so navbar/profile reflect changes immediately
        localStorage.setItem('dc_user', JSON.stringify(res.user));
        this.userSub.next(res.user);
      })
    );
  }
}
