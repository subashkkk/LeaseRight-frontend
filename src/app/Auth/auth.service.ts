import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; // Update with your API URL
  private readonly VENDOR_STORAGE_KEY = 'vendor_registrations';
  private readonly COMPANY_STORAGE_KEY = 'company_registrations';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(credentials: { email: string; password: string }): Observable<any> {
    // Check LocalStorage for vendor and company registrations
    const vendors = this.getStoredUsers(this.VENDOR_STORAGE_KEY);
    const companies = this.getStoredUsers(this.COMPANY_STORAGE_KEY);

    // Search in vendors
    const vendor = vendors.find(v => 
      v.email === credentials.email && v.password === credentials.password
    );

    if (vendor) {
      const response = {
        success: true,
        message: 'Login successful',
        token: this.generateToken(vendor.email),
        user: {
          email: vendor.email,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          companyName: vendor.companyName
        },
        userRole: 'vendor',
        userName: `${vendor.firstName} ${vendor.lastName}`
      };
      
      console.log('✅ Vendor login successful:', vendor.email);
      return of(response).pipe(delay(1000)); // Simulate network delay
    }

    // Search in companies
    const company = companies.find(c => 
      c.email === credentials.email && c.password === credentials.password
    );

    if (company) {
      const response = {
        success: true,
        message: 'Login successful',
        token: this.generateToken(company.email),
        user: {
          email: company.email,
          firstName: company.firstName,
          lastName: company.lastName,
          companyName: company.companyName
        },
        userRole: 'company',
        userName: `${company.firstName} ${company.lastName}`
      };
      
      console.log('✅ Company login successful:', company.email);
      return of(response).pipe(delay(1000)); // Simulate network delay
    }

    // If no match found, return error
    console.log('❌ Login failed: Invalid credentials');
    return throwError(() => ({
      error: { message: 'Invalid email or password' }
    })).pipe(delay(1000));

    // === FUTURE IMPLEMENTATION (Backend API) ===
    // When backend is ready, uncomment this:
    // return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  private getStoredUsers(storageKey: string): any[] {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${storageKey}:`, error);
      return [];
    }
  }

  private generateToken(email: string): string {
    // Generate a simple token for demo purposes
    // In production, this would come from the backend
    const timestamp = new Date().getTime();
    return btoa(`${email}:${timestamp}`);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  logout(): void {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    console.log('🚪 User logged out');
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken') || !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }
}
