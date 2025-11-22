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
  // Set to true to use real backend with BCrypt password validation
  private USE_BACKEND_API = true; // Backend login is now working!
  
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
      
      // Backend expects 'mail' not 'email'
      const backendCredentials = {
        mail: credentials.email,
        password: credentials.password
      };
      
      return this.http.post(url, backendCredentials).pipe(
        map((response: any) => {
          console.log('✅ Backend login successful:', response);
          
          // Backend response format: { success, message, userInfo: { id, name, mail, role, contactNo }, token }
          if (response.success && response.userInfo && response.token) {
            // Use the REAL JWT token from backend (not fake generated one)
            const jwtToken = response.token;
            localStorage.setItem('authToken', jwtToken);
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(response.userInfo));
            localStorage.setItem('userRole', response.userInfo.role);
            localStorage.setItem('userName', response.userInfo.name);
            localStorage.setItem('userEmail', response.userInfo.mail);
            
            // Return formatted response for frontend compatibility
            return {
              success: response.success,
              message: response.message,
              token: jwtToken,
              user: {
                id: response.userInfo.id,  // ← CRITICAL: Include user ID!
                email: response.userInfo.mail,
                firstName: response.userInfo.name.split(' ')[0],
                lastName: response.userInfo.name.split(' ').slice(1).join(' ') || '',
                name: response.userInfo.name,
                role: response.userInfo.role,
                contactNo: response.userInfo.contactNo
              },
              userRole: response.userInfo.role,
              userName: response.userInfo.name
            };
          } else {
            throw new Error(response.message || 'Login failed');
          }
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

  /**
   * Update user profile
   * Uses backend API if USE_BACKEND_API is true, otherwise updates localStorage
   */
  updateProfile(profileData: any): Observable<any> {
    if (this.USE_BACKEND_API) {
      // Get user ID from stored user data
      const currentUser = this.getUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.error('❌ No user ID found for profile update');
        return throwError(() => new Error('User ID not found'));
      }
      
      // Replace :id in URL with actual user ID
      const endpoint = API_CONFIG.USER.UPDATE_PROFILE.replace(':id', userId.toString());
      const url = getApiUrl(endpoint);
      
      console.log('📝 Updating user profile via backend API:', url);
      console.log('📦 Profile data:', profileData);
      
      return this.http.put(url, profileData).pipe(
        catchError(error => {
          console.error('❌ Backend profile update failed:', error);
          console.error('❌ Error details:', error.error);
          return throwError(() => error);
        })
      );
    } else {
      // LocalStorage fallback
      try {
        const currentUser = this.getUser();
        const updatedUser = { ...currentUser, ...profileData };
        this.setUser(updatedUser);
        console.log('✅ Profile updated (LocalStorage):', updatedUser);
        return of({ success: true, message: 'Profile updated successfully', data: updatedUser });
      } catch (error) {
        console.error('❌ Error updating profile:', error);
        return throwError(() => error);
      }
    }
  }

  /**
   * Get user profile from backend
   */
  getProfile(): Observable<any> {
    if (this.USE_BACKEND_API) {
      // Get user ID from stored user data
      const currentUser = this.getUser();
      const userId = currentUser?.id;
      
      if (!userId) {
        console.warn('⚠️ No user ID found, returning localStorage data');
        return of(currentUser);
      }
      
      // Replace :id in URL with actual user ID
      const endpoint = API_CONFIG.USER.GET_PROFILE.replace(':id', userId.toString());
      const url = getApiUrl(endpoint);
      
      console.log('📥 Fetching user profile from backend:', url);
      console.log('🔑 User ID:', userId);
      
      return this.http.get(url).pipe(
        map((response: any) => {
          console.log('✅ Profile fetched from backend:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Failed to fetch profile from backend:', error);
          console.error('❌ Error details:', error.error);
          console.warn('⚠️ Falling back to localStorage data');
          // Return localStorage data as fallback
          return of(currentUser);
        })
      );
    } else {
      // LocalStorage fallback
      const user = this.getUser();
      console.log('📦 Returning profile from localStorage:', user);
      return of(user);
    }
  }
}
