import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { AdminService, AdminStats, UserActivity } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLCanvasElement>;

  userName: string = '';
  searchQuery: string = '';
  activeTab: string = 'all';
  currentDate: string = '';
  isLoading: boolean = false;
  hasMoreData: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  
  stats: AdminStats = {
    totalUsers: 0,
    totalVendors: 0,
    totalCompanies: 0,
    totalAdmins: 0,
    pendingRequests: 0,
    systemHealth: 98
  };

  allUsers: any[] = [];
  vendors: any[] = [];
  companies: any[] = [];
  recentActivities: UserActivity[] = [];
  chartData: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminService: AdminService
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
    this.currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('📊 Loading dashboard data...');
    
    this.adminService.getDashboardData().subscribe({
      next: (data) => {
        console.log('✅ Dashboard data loaded:', data);
        this.stats = data.stats;
        this.allUsers = this.sortUsersByRole(data.vendors.concat(data.companies));
        this.vendors = data.vendors;
        this.companies = data.companies;
        this.recentActivities = data.recentActivities.slice(0, 10);

        // Override counts using backend totals
        this.adminService.getTotalActiveUsers().subscribe({
          next: (count) => this.stats.totalUsers = count,
          error: (error) => console.error('❌ Failed to load total users count:', error)
        });

        this.adminService.getTotalActiveVendors().subscribe({
          next: (count) => this.stats.totalVendors = count,
          error: (error) => console.error('❌ Failed to load total vendors count:', error)
        });

        this.adminService.getTotalActiveCompanies().subscribe({
          next: (count) => this.stats.totalCompanies = count,
          error: (error) => console.error('❌ Failed to load total companies count:', error)
        });
      },
      error: (error) => {
        console.error('❌ Failed to load dashboard data:', error);
        // Fallback to empty data
        this.allUsers = [];
        this.vendors = [];
        this.companies = [];
        this.recentActivities = [];
      }
    });

    // Load chart data
    this.adminService.getChartData().subscribe({
      next: (data) => {
        this.chartData = data;
      },
      error: (error) => {
        console.error('❌ Failed to load chart data:', error);
      }
    });
  }

  private sortUsersByRole(users: any[]): any[] {
    // Sort: admin first, then company, then vendor
    const roleOrder: { [key: string]: number } = { admin: 1, company: 2, vendor: 3 };
    return users.sort((a, b) => (roleOrder[a.role] || 4) - (roleOrder[b.role] || 4));
  }

  getFilteredUsers(): any[] {
    let filtered = this.allUsers;

    // Filter by tab
    switch (this.activeTab) {
      case 'vendors':
        filtered = this.allUsers.filter(u => u.role === 'vendor');
        break;
      case 'companies':
        filtered = this.allUsers.filter(u => u.role === 'company');
        break;
      case 'pending':
        filtered = this.allUsers.filter(u => !u.isVerified);
        break;
      default:
        filtered = this.allUsers;
    }

    // Filter by search query
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(query) ||
        u.mail?.toLowerCase().includes(query) ||
        u.role?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getProgressOffset(percentage: number): number {
    const circumference = 2 * Math.PI * 90;
    return circumference - (percentage / 100) * circumference;
  }

  viewUser(user: any): void {
    console.log('👁️ View user:', user);
    alert(`User Details:\nName: ${user.name}\nEmail: ${user.mail}\nRole: ${user.role}\nStatus: ${user.isVerified ? 'Verified' : 'Pending'}`);
  }

  approveUser(user: any): void {
    if (confirm(`Approve user: ${user.name}?`)) {
      console.log('✅ Approving user:', user.id);
      
      this.adminService.approveUser(user.id).subscribe({
        next: (response) => {
          console.log('✅ User approved:', response);
          alert(`User ${user.name} has been approved!`);
          this.loadDashboardData(); // Reload data
        },
        error: (error) => {
          console.error('❌ Failed to approve user:', error);
          alert('Failed to approve user. Please try again.');
        }
      });
    }
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete user: ${user.name}?`)) {
      console.log('🗑️ Deleting user:', user.id);
      
      this.adminService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('✅ User deleted:', response);
          alert(`User ${user.name} has been deleted!`);
          this.loadDashboardData(); // Reload data
        },
        error: (error) => {
          console.error('❌ Failed to delete user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  // Quick Action Methods
  loadAllUsers(): void {
    console.log('📥 Loading all users...');
    this.isLoading = true;
    this.activeTab = 'all';
    this.loadDashboardData();
  }

  loadVendors(): void {
    console.log('📥 Loading vendors...');
    this.isLoading = true;
    this.activeTab = 'vendors';
    
    this.adminService.getUsersByRole('vendor').subscribe({
      next: (vendors) => {
        this.vendors = vendors;
        this.allUsers = [...this.allUsers.filter(u => u.role !== 'vendor'), ...vendors];
        this.isLoading = false;
        console.log('✅ Vendors loaded:', vendors.length);
      },
      error: (error) => {
        console.error('❌ Failed to load vendors:', error);
        this.isLoading = false;
      }
    });
  }

  loadCompanies(): void {
    console.log('📥 Loading companies...');
    this.isLoading = true;
    this.activeTab = 'companies';
    
    this.adminService.getUsersByRole('company').subscribe({
      next: (companies) => {
        this.companies = companies;
        this.allUsers = [...this.allUsers.filter(u => u.role !== 'company'), ...companies];
        this.isLoading = false;
        console.log('✅ Companies loaded:', companies.length);
      },
      error: (error) => {
        console.error('❌ Failed to load companies:', error);
        this.isLoading = false;
      }
    });
  }

  refreshData(): void {
    console.log('🔄 Refreshing dashboard data...');
    this.isLoading = true;
    this.currentPage = 1;
    this.loadDashboardData();
    setTimeout(() => {
      this.isLoading = false;
      alert('Dashboard data refreshed!');
    }, 1000);
  }

  exportData(): void {
    console.log('💾 Exporting data...');
    const users = this.getFilteredUsers();
    
    // Convert to CSV
    const headers = ['ID', 'Name', 'Email', 'Role', 'Contact', 'Status'];
    const csvData = users.map(u => [
      u.id,
      u.name,
      u.mail,
      u.role,
      u.contactNo || 'N/A',
      u.isVerified ? 'Verified' : 'Pending'
    ]);
    
    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Data exported successfully');
    alert(`Exported ${users.length} users to CSV`);
  }

  loadMoreUsers(): void {
    if (this.isLoading) return;
    
    console.log('📥 Loading more users...');
    this.isLoading = true;
    this.currentPage++;
    
    // Simulate loading more data
    setTimeout(() => {
      this.isLoading = false;
      // In a real app, you would fetch more data from the backend here
      console.log('✅ More users loaded');
    }, 1500);
  }
}
