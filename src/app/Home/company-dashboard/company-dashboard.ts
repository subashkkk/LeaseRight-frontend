import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle } from '../../services/lease-request.service';
import { QuotationsComponent } from '../../company-dashboard/quotations/quotations';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuotationsComponent],
  templateUrl: './company-dashboard.html',
  styleUrl: './company-dashboard.css',
})
export class CompanyDashboard implements OnInit {
  userName: string = '';
  userEmail: string = '';
  companyName: string = '';
  
  // Statistics
  stats: any = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  };

  // Data
  myRequests: LeaseRequest[] = [];
  availableVehicles: Vehicle[] = [];
  
  // Vendor quotations visibility
  showVendorQuotations: boolean = false;
  
  // UI State
  showRequestForm: boolean = false;
  showVehicleBrowser: boolean = false;
  requestForm!: FormGroup;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private leaseService: LeaseRequestService,
    private fb: FormBuilder
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

    // Verify user is a company
    if (role !== 'company') {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.userName = this.authService.getUserName() || 'Company User';
    this.userEmail = user?.email || '';
    this.companyName = user?.companyName || '';

    // Initialize form
    this.initializeRequestForm();

    // Load data
    this.loadDashboardData();
  }

  initializeRequestForm(): void {
    this.requestForm = this.fb.group({
      vehicleType: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      leaseDuration: [12, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });
  }

  loadDashboardData(): void {
    // Load statistics
    this.stats = this.leaseService.getCompanyStats(this.userEmail);

    // Load my requests
    this.myRequests = this.leaseService.getRequestsByCompany(this.userEmail);

    // Load available vehicles
    this.availableVehicles = this.leaseService.getAvailableVehicles();
  }

  toggleRequestForm(): void {
    this.showRequestForm = !this.showRequestForm;
    this.showVehicleBrowser = false;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.showRequestForm) {
      this.requestForm.reset({
        quantity: 1,
        leaseDuration: 12
      });
    }
  }

  toggleVehicleBrowser(): void {
    this.showVehicleBrowser = !this.showVehicleBrowser;
    this.showRequestForm = false;
    this.showVendorQuotations = false;
  }

  toggleVendorQuotations(): void {
    this.showVendorQuotations = !this.showVendorQuotations;
    // Hide other sections when showing quotations
    if (this.showVendorQuotations) {
      this.showRequestForm = false;
      this.showVehicleBrowser = false;
    }
  }

  submitLeaseRequest(): void {
    if (this.requestForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const requestData = {
      companyEmail: this.userEmail,
      companyName: this.companyName,
      contactPerson: this.userName,
      vehicleType: this.requestForm.value.vehicleType,
      quantity: this.requestForm.value.quantity,
      leaseDuration: this.requestForm.value.leaseDuration,
      startDate: this.requestForm.value.startDate,
      budget: this.requestForm.value.budget,
      description: this.requestForm.value.description
    };

    this.leaseService.createLeaseRequest(requestData)
      .then(response => {
        this.isSubmitting = false;
        this.successMessage = 'Lease request submitted successfully!';
        this.requestForm.reset({ quantity: 1, leaseDuration: 12 });
        this.loadDashboardData();
        
        setTimeout(() => {
          this.showRequestForm = false;
          this.successMessage = '';
        }, 2000);
      })
      .catch(error => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to submit request. Please try again.';
        console.error('Error:', error);
      });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'approved': return 'fa-check-circle';
      case 'rejected': return 'fa-times-circle';
      default: return 'fa-clock';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
