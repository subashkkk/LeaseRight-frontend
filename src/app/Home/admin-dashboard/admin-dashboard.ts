import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle } from '../../services/lease-request.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  userName: string = '';

  stats: any = {
    totalCompanies: 0,
    totalVendors: 0,
    totalRequests: 0,
    pendingRequests: 0,
  };

  companies: any[] = [];
  vendors: any[] = [];
  recentRequests: LeaseRequest[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private leaseService: LeaseRequestService
  ) {}

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const role = this.authService.getUserRole();
    if (role !== 'admin') {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.userName = this.authService.getUserName() || 'System Admin';

    this.loadData();
  }

  loadData(): void {
    // Companies and vendors from LocalStorage (same keys as AuthService)
    this.companies = this.getStoredUsers('company_registrations');
    this.vendors = this.getStoredUsers('vendor_registrations');

    // Requests list (can be populated from LeaseRequestService when available)
    this.recentRequests = [];

    this.stats.totalCompanies = this.companies.length;
    this.stats.totalVendors = this.vendors.length;
    this.stats.totalRequests = this.recentRequests.length;
    this.stats.pendingRequests = this.recentRequests.filter(r => r.status === 'pending').length;
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

  logout(): void {
    this.authService.logout();
  }
}
