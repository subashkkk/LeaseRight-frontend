import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle, VehicleType } from '../../services/lease-request.service';
import { QuotationsComponent } from '../../company-dashboard/quotations/quotations';
import { ProfileDropdownComponent, ProfileMenuItem } from '../../shared/profile-dropdown/profile-dropdown.component';
import { AccountDetailsComponent } from '../../shared/account-details/account-details.component';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuotationsComponent, ProfileDropdownComponent, AccountDetailsComponent],
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
  activeLeases: any[] = [];  // Approved quotations
  
  // Section visibility
  showVendorQuotations: boolean = false;
  showActiveLeases: boolean = false;
  showAccountDetails: boolean = false;
  
  // Profile menu items
  profileMenuItems: ProfileMenuItem[] = [];
  
  // Create new lease request form
  showRequestForm: boolean = false;
  isEditingRequest: boolean = false;
  editingRequestId: number | null = null;
  
  // UI State
  
  // Data loaded flags
  myRequestsLoaded: boolean = false;
  activeLeasesLoaded: boolean = false;
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
    
    // Get actual company ID from user data (from JWT token)
    const userDataString = localStorage.getItem('user');
    console.log('📦 Raw user data from localStorage:', userDataString);
    
    if (!userDataString) {
      console.error('❌ CRITICAL: No user data in localStorage! User must login again.');
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }
    
    const userData = JSON.parse(userDataString || '{}');
    console.log('📦 Parsed user data:', userData);
    console.log('📦 userData.id:', userData.id);
    console.log('📦 typeof userData.id:', typeof userData.id);
    
    if (!userData.id) {
      console.error('❌ CRITICAL: User data has no ID! userData:', userData);
      alert('Invalid session data. Please login again.');
      this.router.navigate(['/login']);
      return;
    }
    
    this.companyId = userData.id; // Use actual user ID as company ID (NO FALLBACK!)
    console.log('🔑 Company ID set to:', this.companyId);
    console.log('🔑 Company ID type:', typeof this.companyId);

    // Initialize form
    this.initializeRequestForm();

    // Setup profile menu items
    this.setupProfileMenu();

    // Load stats immediately to show counts
    this.loadStats();
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

  async loadStats(): Promise<void> {
    try {
      console.log(`🔄 Loading stats counts for company ID: ${this.companyId}...`);
      const companyRequests = await this.leaseService.getRequestsByCompany(this.companyId);
      
      // Calculate ONLY stats from the data - don't store the full data yet
      this.stats = {
        total: companyRequests.length,
        pending: companyRequests.filter(r => !r.status || r.status === 'pending').length,
        approved: companyRequests.filter(r => r.status === 'approved').length,
        rejected: companyRequests.filter(r => r.status === 'rejected').length
      };
      
      console.log('✅ Stats counts loaded:', this.stats);
      console.log('📊 Stats boxes will display:', {
        Total: this.stats.total,
        Pending: this.stats.pending,
        Approved: this.stats.approved,
        Rejected: this.stats.rejected
      });
    } catch (error: any) {
      console.error('❌ Error loading stats:', error);
      this.stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  async loadMyRequests(): Promise<void> {
    // If detailed data already loaded, just return
    if (this.myRequestsLoaded) {
      console.log('✅ Detailed requests already loaded');
      return;
    }
    
    try {
      console.log(`🔄 Loading detailed request list for company ID: ${this.companyId}...`);
      const companyRequests = await this.leaseService.getRequestsByCompany(this.companyId);
      this.myRequests = companyRequests;
      this.myRequestsLoaded = true;
      
      console.log('✅ Detailed request list loaded:', this.myRequests.length, 'items');
    } catch (error: any) {
      console.error('❌ Error loading detailed requests:', error);
      this.myRequests = [];
      alert(`Error loading requests: ${error?.message || 'Unknown error'}`);
    }
  }

  unloadMyRequests(): void {
    this.myRequests = [];
    this.myRequestsLoaded = false;
    console.log('🗑️ Detailed requests unloaded');
  }

  async loadActiveLeases(): Promise<void> {
    if (this.activeLeasesLoaded) return; // Already loaded
    
    try {
      console.log('🔄 Loading active leases (approved quotations)...');
      // Load approved quotations from your quotations service
      // For now, this is a placeholder - you'll need to implement the actual API call
      // TODO: Replace with actual API call to get approved quotations
      this.activeLeases = [];
      this.activeLeasesLoaded = true;
      console.log('✅ Active leases loaded:', this.activeLeases.length);
    } catch (error: any) {
      console.error('❌ Error loading active leases:', error);
      this.activeLeases = [];
      alert(`Error loading active leases: ${error?.message || 'Unknown error'}`);
    }
  }

  // Quotations now load inside the quotations component itself via button click

  async toggleRequestForm(): Promise<void> {
    this.showRequestForm = !this.showRequestForm;
    this.showActiveLeases = false;
    this.showVendorQuotations = false;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (this.showRequestForm) {
      this.requestForm.reset({
        leaseDuration: 12
      });
      window.scrollTo(0, 0);
    }
  }

  async toggleActiveLeases(): Promise<void> {
    this.showActiveLeases = !this.showActiveLeases;
    this.showRequestForm = false;
    this.showVendorQuotations = false;
    
    // Load data only when opening the section
    if (this.showActiveLeases) {
      await this.loadActiveLeases();
    }
  }

  toggleVendorQuotations(): void {
    this.showVendorQuotations = !this.showVendorQuotations;
    this.showRequestForm = false;
    this.showActiveLeases = false;
    // Quotations component handles its own loading via button click
  }

  submitLeaseRequest(): void {
    if (this.requestForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    if (this.requestForm.value.minBudget > this.requestForm.value.maxBudget) {
      this.errorMessage = 'Minimum budget cannot be greater than maximum budget';
      return;
    }

    if (this.requestForm.value.leaseDuration < 1 || this.requestForm.value.leaseDuration > 60) {
      this.errorMessage = 'Lease duration must be between 1 and 60 months';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Check if we're editing or creating
    if (this.isEditingRequest && this.editingRequestId) {
      this.updateLeaseRequest();
    } else {
      this.createLeaseRequest();
    }
  }

  createLeaseRequest(): void {
    // Prepare data matching backend LeaseRequestDTO
    const requestData: Omit<LeaseRequest, 'id' | 'status' | 'createdAt'> = {
      vehicleType: this.requestForm.value.vehicleType as VehicleType,
      preferredModel: this.requestForm.value.preferredModel || undefined,
      leaseDuration: this.requestForm.value.leaseDuration,
      minBudget: this.requestForm.value.minBudget,
      maxBudget: this.requestForm.value.maxBudget,
      additionalRequirements: this.requestForm.value.additionalRequirements || undefined,
      companyId: this.companyId,  // Send actual company ID from JWT token
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
        this.isEditingRequest = false;
        this.editingRequestId = null;
        
        // Reload stats and requests
        this.loadStats();
        if (this.myRequestsLoaded) {
          this.myRequestsLoaded = false;
        }
        
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

  editRequest(request: LeaseRequest): void {
    console.log('✏️ Editing request:', request);
    this.isEditingRequest = true;
    this.editingRequestId = request.id || null;
    
    this.requestForm.patchValue({
      vehicleType: request.vehicleType,
      preferredModel: request.preferredModel || '',
      leaseDuration: request.leaseDuration,
      minBudget: request.minBudget,
      maxBudget: request.maxBudget,
      additionalRequirements: request.additionalRequirements || ''
    });
    
    this.showRequestForm = true;
    this.showActiveLeases = false;
    this.showVendorQuotations = false;
    
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }

  updateLeaseRequest(): void {
    const updatedData: Omit<LeaseRequest, 'status' | 'createdAt'> = {
      id: this.editingRequestId!,
      companyId: this.companyId,
      vehicleType: this.requestForm.value.vehicleType,
      preferredModel: this.requestForm.value.preferredModel || null,
      leaseDuration: this.requestForm.value.leaseDuration,
      minBudget: this.requestForm.value.minBudget,
      maxBudget: this.requestForm.value.maxBudget,
      additionalRequirements: this.requestForm.value.additionalRequirements || null
    };

    this.leaseService.updateLeaseRequest(this.editingRequestId!, updatedData).then(() => {
      this.successMessage = 'Lease request updated successfully!';
      this.requestForm.reset();
      this.isSubmitting = false;
      this.isEditingRequest = false;
      this.editingRequestId = null;
      
      this.loadStats();
      if (this.myRequestsLoaded) {
        this.loadMyRequests();
      }
      
      setTimeout(() => {
        this.showRequestForm = false;
        this.successMessage = '';
      }, 2000);
    }).catch((error: any) => {
      console.error('Error updating lease request:', error);
      this.errorMessage = error?.message || 'Failed to update lease request';
      this.isSubmitting = false;
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

  setupProfileMenu(): void {
    this.profileMenuItems = [
      { icon: 'fa-user-circle', label: 'Account Details', action: 'account' },
      { icon: 'fa-file-contract', label: 'Lease Requests', action: 'requests', badge: this.stats.total },
      { icon: 'fa-car', label: 'My Leases', action: 'leases', badge: this.activeLeases.length },
      { icon: 'fa-file-invoice', label: 'Quotations', action: 'quotations' }
    ];
  }

  onProfileMenuClick(action: string): void {
    // Close all sections first
    this.showAccountDetails = false;
    this.showRequestForm = false;
    this.showActiveLeases = false;
    this.showVendorQuotations = false;

    // Open requested section
    switch (action) {
      case 'account':
        this.showAccountDetails = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'requests':
        this.loadMyRequests();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      case 'leases':
        this.toggleActiveLeases();
        break;
      case 'quotations':
        this.toggleVendorQuotations();
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
