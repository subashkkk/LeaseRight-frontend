import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle, VehicleType } from '../../services/lease-request.service';
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
  companyId: number = 0;  // Backend companyId
  
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
    // For now, use a mock companyId (1). In production, this should come from backend after login
    this.companyId = 1;

    // Initialize form
    this.initializeRequestForm();

    // Load data
    this.loadDashboardData();
  }

  initializeRequestForm(): void {
    // Form matching backend LeaseRequestDTO fields
    this.requestForm = this.fb.group({
      vehicleType: ['', Validators.required],
      preferredModel: [''],  // Optional in backend
      leaseDuration: [12, [Validators.required, Validators.min(1)]],  // In months/years
      minBudget: ['', [Validators.required, Validators.min(0)]],
      maxBudget: ['', [Validators.required, Validators.min(0)]],
      additionalRequirements: ['']  // Optional
    });
  }

  async loadDashboardData(): Promise<void> {
    try {
      // TEMPORARY: Show all requests since companyId is not associated yet
      // TODO: Filter by actual companyId after login integration
      console.log('🔄 Loading all requests (companyId not associated yet)...');
      
      const allRequests = await this.leaseService.getAllLeaseRequests();
      this.myRequests = allRequests;
      
      // Calculate stats from all requests
      this.stats = {
        total: allRequests.length,
        pending: allRequests.filter(r => !r.status || r.status === 'pending').length,
        approved: allRequests.filter(r => r.status === 'approved').length,
        rejected: allRequests.filter(r => r.status === 'rejected').length
      };

      // Load available vehicles (still using localStorage for now)
      this.availableVehicles = this.leaseService.getAvailableVehicles();
      
      console.log('✅ Dashboard data loaded:', {
        stats: this.stats,
        requests: this.myRequests.length,
        vehicles: this.availableVehicles.length,
        requestDetails: this.myRequests
      });
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      this.stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
      this.myRequests = [];
      this.availableVehicles = [];
    }
  }

  toggleRequestForm(): void {
    this.showRequestForm = !this.showRequestForm;
    this.showVehicleBrowser = false;
    this.showVendorQuotations = false;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.showRequestForm) {
      this.requestForm.reset({
        leaseDuration: 12
      });
      // Scroll to top when opening form
      window.scrollTo(0, 0);
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

    // Validate budget range
    const minBudget = this.requestForm.value.minBudget;
    const maxBudget = this.requestForm.value.maxBudget;
    
    if (minBudget > maxBudget) {
      this.errorMessage = 'Minimum budget cannot be greater than maximum budget';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare data matching backend LeaseRequestDTO
    const requestData: Omit<LeaseRequest, 'id' | 'status' | 'createdAt'> = {
      vehicleType: this.requestForm.value.vehicleType as VehicleType,
      preferredModel: this.requestForm.value.preferredModel || undefined,
      leaseDuration: this.requestForm.value.leaseDuration,
      minBudget: this.requestForm.value.minBudget,
      maxBudget: this.requestForm.value.maxBudget,
      additionalRequirements: this.requestForm.value.additionalRequirements || undefined,
      // Don't send companyId if it's mock/test data (0 or 1)
      // companyId: this.companyId,
      // Additional fields for localStorage display
      companyEmail: this.userEmail,
      companyName: this.companyName
    };

    console.log('📤 Submitting lease request:', requestData);

    this.leaseService.createLeaseRequest(requestData)
      .then(response => {
        this.isSubmitting = false;
        this.successMessage = 'Lease request submitted successfully! ✅';
        this.requestForm.reset({ leaseDuration: 12 });
        this.loadDashboardData();
        
        setTimeout(() => {
          this.showRequestForm = false;
          this.successMessage = '';
        }, 3000);
      })
      .catch(error => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'Failed to submit request. Please try again.';
        console.error('❌ Error submitting lease request:', error);
      });
  }

  getStatusClass(status: string | undefined): string {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string | undefined): string {
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
