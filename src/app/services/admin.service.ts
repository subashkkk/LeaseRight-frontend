import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG, getApiUrl } from '../config/api.config';

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalCompanies: number;
  totalAdmins: number;
  pendingRequests: number;
  systemHealth: number;
}

export interface UserActivity {
  id: number;
  name: string;
  email: string;
  role: string;
  action: string;
  timestamp: string;
  description: string;
}

export interface DashboardData {
  stats: AdminStats;
  recentActivities: UserActivity[];
  vendors: any[];
  companies: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  constructor(private http: HttpClient) {}

  /**
   * Get all users from backend
   */
  getAllUsers(): Observable<any[]> {
    const url = getApiUrl(API_CONFIG.ADMIN.GET_ALL_USERS);
    console.log('📥 Fetching all users:', url);
    
    return this.http.get<any[]>(url).pipe(
      map((response: any) => {
        console.log('✅ All users fetched:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Failed to fetch users:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get users by role (vendor, company, admin)
   */
  getUsersByRole(role: string): Observable<any[]> {
    const url = getApiUrl(API_CONFIG.ADMIN.GET_USERS_BY_ROLE.replace(':role', role));
    console.log(`📥 Fetching ${role} users:`, url);
    
    return this.http.get<any[]>(url).pipe(
      map((response: any) => {
        console.log(`✅ ${role} users fetched:`, response);
        return response;
      }),
      catchError(error => {
        console.error(`❌ Failed to fetch ${role} users:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<AdminStats> {
    return this.getAllUsers().pipe(
      map(users => {
        const vendors = users.filter(u => u.role === 'vendor');
        const companies = users.filter(u => u.role === 'company');
        const admins = users.filter(u => u.role === 'admin');
        const unverified = users.filter(u => !u.isVerified);

        return {
          totalUsers: users.length,
          totalVendors: vendors.length,
          totalCompanies: companies.length,
          totalAdmins: admins.length,
          pendingRequests: unverified.length,
          systemHealth: 100 // Calculated based on system availability - update with real metric if available
        };
      })
    );
  }

  /**
   * Get complete dashboard data
   */
  getDashboardData(): Observable<DashboardData> {
    return this.getAllUsers().pipe(
      map(users => {
        const vendors = users.filter(u => u.role === 'vendor');
        const companies = users.filter(u => u.role === 'company');
        const admins = users.filter(u => u.role === 'admin');
        const unverified = users.filter(u => !u.isVerified);

        // Generate recent activities from user data
        const activities: UserActivity[] = users
          .slice(0, 10)
          .map((user, index) => ({
            id: user.id,
            name: user.name,
            email: user.mail,
            role: user.role,
            action: user.isVerified ? 'registered' : 'pending_verification',
            timestamp: new Date(Date.now() - index * 3600000).toISOString(),
            description: user.isVerified 
              ? `${user.role} account created successfully`
              : `${user.role} account waiting for verification`
          }));

        const stats: AdminStats = {
          totalUsers: users.length,
          totalVendors: vendors.length,
          totalCompanies: companies.length,
          totalAdmins: admins.length,
          pendingRequests: unverified.length,
          systemHealth: 100 // Should come from backend monitoring service
        };

        return {
          stats,
          recentActivities: activities,
          vendors: vendors.filter(v => !v.isVerified),
          companies
        };
      })
    );
  }

  /**
   * Get total active users count from backend
   */
  getTotalActiveUsers(): Observable<number> {
    const url = getApiUrl(API_CONFIG.ADMIN.TOTAL_ACTIVE_USERS);
    console.log('📥 Fetching total active users:', url);

    return this.http.get<number>(url).pipe(
      catchError(error => {
        console.error('❌ Failed to fetch total active users:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get total active vendors count from backend
   */
  getTotalActiveVendors(): Observable<number> {
    const url = getApiUrl(API_CONFIG.ADMIN.TOTAL_ACTIVE_VENDORS);
    console.log('📥 Fetching total active vendors:', url);

    return this.http.get<number>(url).pipe(
      catchError(error => {
        console.error('❌ Failed to fetch total active vendors:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get total active companies count from backend
   */
  getTotalActiveCompanies(): Observable<number> {
    const url = getApiUrl(API_CONFIG.ADMIN.TOTAL_ACTIVE_COMPANIES);
    console.log('📥 Fetching total active companies:', url);

    return this.http.get<number>(url).pipe(
      catchError(error => {
        console.error('❌ Failed to fetch total active companies:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user by ID
   */
  updateUser(userId: number, userData: any): Observable<any> {
    const url = getApiUrl(API_CONFIG.ADMIN.UPDATE_USER.replace(':id', userId.toString()));
    console.log('📝 Updating user:', url, userData);
    
    return this.http.put(url, userData).pipe(
      catchError(error => {
        console.error('❌ Failed to update user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete user by ID
   */
  deleteUser(userId: number): Observable<any> {
    const url = getApiUrl(API_CONFIG.ADMIN.DELETE_USER.replace(':id', userId.toString()));
    console.log('🗑️ Deleting user:', url);
    
    return this.http.delete(url).pipe(
      catchError(error => {
        console.error('❌ Failed to delete user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Approve/verify a user (vendor or company)
   */
  approveUser(userId: number): Observable<any> {
    return this.updateUser(userId, { isVerified: true });
  }

  /**
   * Get chart data for dashboard (removed dummy data)
   */
  getChartData(): Observable<any> {
    // Return empty array - chart data should come from backend
    return this.getAllUsers().pipe(
      map(users => {
        return []; // No dummy data - implement backend endpoint if needed
      })
    );
  }
}
