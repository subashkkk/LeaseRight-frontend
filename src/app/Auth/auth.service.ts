import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { delay, map, catchError } from 'rxjs/operators';
import { API_CONFIG, getApiUrl } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Toggle between backend API and LocalStorage  
  // Keep false: Backend login endpoint not implemented yet, using test credentials
  private USE_BACKEND_API = false; // Set to true to use your backend
  
  private readonly VENDOR_STORAGE_KEY = 'vendor_registrations';
  private readonly COMPANY_STORAGE_KEY = 'company_registrations';
  private readonly ADMIN_USERS: Array<{ email: string; password: string; firstName: string; lastName: string }> = [
    {
      email: 'admin@leaseright.com',
      password: 'Admin@123',
      firstName: 'System',
      lastName: 'Admin'
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Login with email and password
   * Uses backend API if USE_BACKEND_API is true, otherwise uses LocalStorage
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    if (this.USE_BACKEND_API) {
      // Backend API login
      const url = getApiUrl(API_CONFIG.AUTH.LOGIN);
      console.log('🔐 Logging in via backend API:', url);
      
      return this.http.post(url, credentials).pipe(
        map((response: any) => {
          console.log('✅ Backend login successful:', response);
          
          // Store authentication data
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          if (response.userRole) {
            localStorage.setItem('userRole', response.userRole);
          }
          if (response.userName || (response.user && response.user.firstName)) {
            const userName = response.userName || `${response.user.firstName} ${response.user.lastName}`;
            localStorage.setItem('userName', userName);
          }
          
          return response;
        }),
        catchError(error => {
          console.error('❌ Backend login failed:', error);
          return throwError(() => error);
        })
      );
    } else {
      // LocalStorage-based login (fallback)
      return this.loginWithLocalStorage(credentials);
    }
  }

  /**
   * LocalStorage-based login (for testing without backend)
   */
  private loginWithLocalStorage(credentials: { email: string; password: string }): Observable<any> {
    const vendors = this.getStoredUsers(this.VENDOR_STORAGE_KEY);
    const companies = this.getStoredUsers(this.COMPANY_STORAGE_KEY);

    // Check admin users (mocked for now)
    const admin = this.ADMIN_USERS.find(a => 
      a.email === credentials.email && a.password === credentials.password
    );

    if (admin) {
      const response = {
        success: true,
        message: 'Login successful',
        token: this.generateToken(admin.email),
        user: {
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          companyName: 'LeaseRight Admin'
        },
        userRole: 'admin',
        userName: `${admin.firstName} ${admin.lastName}`
      };

      console.log('✅ LocalStorage admin login successful:', admin.email);
      return of(response).pipe(delay(500));
    }

    // Search in vendors
    const vendor = vendors.find(v => 
      v.email === credentials.email && v.password === credentials.password
    );

    if (vendor) {
      const userName = vendor.firstName && vendor.lastName
        ? `${vendor.firstName} ${vendor.lastName}`
        : vendor.companyName;

      const response = {
        success: true,
        message: 'Login successful',
        token: this.generateToken(vendor.email),
        user: {
          email: vendor.email,
          firstName: vendor.firstName || vendor.companyName,
          lastName: vendor.lastName || '',
          companyName: vendor.companyName
        },
        userRole: 'vendor',
        userName
      };
      
      console.log('✅ LocalStorage vendor login successful:', vendor.email);
      return of(response).pipe(delay(500));
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
      
      console.log('✅ LocalStorage company login successful:', company.email);
      return of(response).pipe(delay(500));
    }

    // If no match found, return error
    console.log('❌ LocalStorage login failed: Invalid credentials');
    return throwError(() => ({
      error: { message: 'Invalid email or password' }
    })).pipe(delay(500));
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

  /**
   * Register a new user (vendor or company)
   */
  signup(userData: any): Observable<any> {
    if (this.USE_BACKEND_API) {
      const url = getApiUrl(API_CONFIG.AUTH.SIGNUP);
      console.log('📝 Signing up via backend API:', url);
      return this.http.post(url, userData).pipe(
        catchError(error => {
          console.error('❌ Backend signup failed:', error);
          return throwError(() => error);
        })
      );
    } else {
      // LocalStorage fallback (handled by VendorDataService/CompanyDataService)
      return of({ success: true, message: 'Use respective data services for LocalStorage signup' });
    }
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
