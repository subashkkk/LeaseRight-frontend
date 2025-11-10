import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle } from '../../services/lease-request.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css',
})
export class VendorDashboard implements OnInit {
  userName: string = '';
  userEmail: string = '';
  companyName: string = '';

  // Statistics
  stats: any = {
    totalVehicles: 0,
    availableVehicles: 0,
    leasedVehicles: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalRevenue: 0
  };

  // Data
  pendingRequests: LeaseRequest[] = [];
  myVehicles: Vehicle[] = [];
  selectedRequest: LeaseRequest | null = null;
  vendorResponse: string = '';

  // UI State
  showResponseForm: boolean = false;
  isProcessing: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

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

    // Get user details
    const user = this.authService.getUser();
    const role = this.authService.getUserRole();

    // Verify user is a vendor
    if (role !== 'vendor') {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.userName = this.authService.getUserName() || 'Vendor User';
    this.userEmail = user?.email || '';
    this.companyName = user?.companyName || '';

    // Load dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load statistics
    this.stats = this.leaseService.getVendorStats(this.userEmail);

    // Load pending requests
    this.pendingRequests = this.leaseService.getPendingRequests();

    // Load my vehicles
    this.myVehicles = this.leaseService.getVehiclesByVendor(this.userEmail);
  }

  respondToRequest(request: LeaseRequest): void {
    this.selectedRequest = request;
    this.vendorResponse = '';
    this.showResponseForm = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeResponseForm(): void {
    this.showResponseForm = false;
    this.selectedRequest = null;
    this.vendorResponse = '';
  }

  approveRequest(): void {
    if (!this.selectedRequest) return;

    this.isProcessing = true;
    this.errorMessage = '';

    this.leaseService.updateRequestStatus(
      this.selectedRequest.id,
      'approved',
      this.vendorResponse || 'Request approved. We will contact you soon!'
    ).then(() => {
      this.isProcessing = false;
      this.successMessage = 'Request approved successfully!';
      this.loadDashboardData();
      
      setTimeout(() => {
        this.closeResponseForm();
        this.successMessage = '';
      }, 2000);
    }).catch(error => {
      this.isProcessing = false;
      this.errorMessage = 'Failed to update request. Please try again.';
      console.error('Error:', error);
    });
  }

  rejectRequest(): void {
    if (!this.selectedRequest) return;

    this.isProcessing = true;
    this.errorMessage = '';

    this.leaseService.updateRequestStatus(
      this.selectedRequest.id,
      'rejected',
      this.vendorResponse || 'Unable to fulfill this request at this time.'
    ).then(() => {
      this.isProcessing = false;
      this.successMessage = 'Request rejected successfully!';
      this.loadDashboardData();
      
      setTimeout(() => {
        this.closeResponseForm();
        this.successMessage = '';
      }, 2000);
    }).catch(error => {
      this.isProcessing = false;
      this.errorMessage = 'Failed to update request. Please try again.';
      console.error('Error:', error);
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
