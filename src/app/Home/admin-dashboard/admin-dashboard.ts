import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle } from '../../services/lease-request.service';
import { ProfileDropdownComponent, ProfileMenuItem } from '../../shared/profile-dropdown/profile-dropdown.component';
import { AccountDetailsComponent } from '../../shared/account-details/account-details.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ProfileDropdownComponent, AccountDetailsComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  userName: string = '';
  showAccountDetails: boolean = false;
  
  // Profile menu items
  profileMenuItems: ProfileMenuItem[] = [];

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

    this.setupProfileMenu();
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

  setupProfileMenu(): void {
    this.profileMenuItems = [
      { icon: 'fa-user-circle', label: 'Account Details', action: 'account' },
      { icon: 'fa-building', label: 'Companies', action: 'companies', badge: this.stats.totalCompanies },
      { icon: 'fa-truck', label: 'Vendors', action: 'vendors', badge: this.stats.totalVendors },
      { icon: 'fa-clipboard-list', label: 'All Requests', action: 'requests', badge: this.stats.totalRequests }
    ];
  }

  onProfileMenuClick(action: string): void {
    // Close all sections first
    this.showAccountDetails = false;

    // Open requested section
    switch (action) {
      case 'account':
        this.showAccountDetails = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'companies':
      case 'vendors':
      case 'requests':
        // Scroll to relevant section
        window.scrollTo({ top: 600, behavior: 'smooth' });
        break;
    }
  }

  closeAccountDetails(): void {
    this.showAccountDetails = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
