import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  public currentUser = signal<User | null>(this.getStoredUser());
  public token = signal<string | null>(sessionStorage.getItem('mate_token'));

  constructor(private http: HttpClient, private router: Router) {}

  private getStoredUser(): User | null {
    const userStr = sessionStorage.getItem('mate_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  public login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        this.saveSession(res.user, res.token);
      })
    );
  }

  public register(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, data).pipe(
      tap((res) => {
        this.saveSession(res.user, res.token);
      })
    );
  }

  public getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        sessionStorage.setItem('mate_user', JSON.stringify(user));
      })
    );
  }

  public updateProfile(data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap((user) => {
        this.currentUser.set(user);
        sessionStorage.setItem('mate_user', JSON.stringify(user));
      })
    );
  }

  public saveSession(user: User, token: string) {
    this.currentUser.set(user);
    this.token.set(token);
    sessionStorage.setItem('mate_user', JSON.stringify(user));
    sessionStorage.setItem('mate_token', token);
  }

  public logout() {
    this.currentUser.set(null);
    this.token.set(null);
    sessionStorage.removeItem('mate_user');
    sessionStorage.removeItem('mate_token');
    this.router.navigate(['/admin/login']);
  }

  public isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  public isAuthenticated(): boolean {
    return !!this.token();
  }
}
