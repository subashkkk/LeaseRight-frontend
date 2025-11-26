import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, BackendVehicle } from '../../services/lease-request.service';
import { VehicleLookupService, VehicleLookupResult } from '../../services/vehicle-lookup.service';
import { VehicleFlowService } from '../../services/vehicle-flow.service';
import { VendorQuotationService, QuotationSubmitDTO } from '../../services/vendor-quotation.service';
import { ProfileDropdownComponent, ProfileMenuItem } from '../../shared/profile-dropdown/profile-dropdown.component';
import { AccountDetailsComponent } from '../../shared/account-details/account-details.component';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfileDropdownComponent, AccountDetailsComponent],
  templateUrl: './vendor-dashboard.html',
  styleUrls: ['./vendor-dashboard.css'],
})
export class VendorDashboard implements OnInit {
  userName: string = '';
  userEmail: string = '';
  companyName: string = '';
  vendorGst: string = '';
  vendorContact: string = '';

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
  // Vehicles belonging to this vendor (loaded from backend when available)
  myVehicles: BackendVehicle[] = [];
  selectedRequest: LeaseRequest | null = null;
  // Vendor's submitted quotations
  myQuotations: any[] = [];
  vendorId: number = 0;
  quotationsLoading: boolean = false;

  // Add New Vehicle section state
  showAddVehicleSection: boolean = false;
  showIncomingRequestsSection: boolean = false;
  newVehicleNumber: string = '';
  newOwnerName: string = '';
  lookupLoading: boolean = false;
  lookupError: string = '';
  lookedUpVehicle: VehicleLookupResult | null = null;
  rcFrontFileName: string = '';
  rcBackFileName: string = '';

  // Structured quotation details
  quotation: {
    requestedBy: string;
    quotedBy: string;
    quotationNumber: string;
    quotationDate: string;
    validUntil: string;
    monthlyRent: number | null;
    leaseTenure: number | string | null;
    startDate: string;
    notes: string;
    itemDescription: string;
    itemQuantity: number | null;
    itemUnitPrice: number | null;
    taxPercent: number;
    vendorGst: string;
    vendorAddress: string;
    terms: string;
  } = {
    requestedBy: '',
    quotedBy: '',
    quotationNumber: '',
    quotationDate: '',
    validUntil: '',
    monthlyRent: null,
    leaseTenure: null,
    startDate: '',
    notes: '',
    itemDescription: '',
    itemQuantity: null,
    itemUnitPrice: null,
    taxPercent: 0,
    vendorGst: '',
    vendorAddress: '',
    terms: '',
  };

  // UI State
  showResponseForm: boolean = false;
  isProcessing: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  showAccountDetails: boolean = false;
  showMyVehicles: boolean = false;
  showMyQuotes: boolean = false;
  
  // Minimum date for quotation (today's date - blocks past dates)
  minQuoteDate: string = new Date().toISOString().split('T')[0];
  
  // Profile menu items
  profileMenuItems: ProfileMenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private leaseService: LeaseRequestService,
    private vehicleLookupService: VehicleLookupService,
    private vehicleFlow: VehicleFlowService,
    private quotationService: VendorQuotationService
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

    // Prefer stored userName, then backend userInfo.name
    this.userName = this.authService.getUserName() || user?.name || 'Vendor User';

    // For backend login, user is stored as userInfo { id, name, mail, role, contactNo, gstNo }
    // For any older/local flows, email may be under user.email or localStorage 'userEmail'
    this.userEmail = user?.email || user?.mail || localStorage.getItem('userEmail') || '';
    this.companyName = user?.companyName || user?.name || '';
    this.vendorGst = user?.gstNo || '';
    this.vendorContact = user?.contactNo || '';
    this.vendorId = user?.id || 0;

    console.log('VendorDashboard user context:', {
      user,
      role,
      userEmail: this.userEmail,
    });

    // Show success banner if coming back from vehicle save
    const vehicleSaved = this.route.snapshot.queryParamMap.get('vehicleSaved');
    if (vehicleSaved === '1' || vehicleSaved === 'true') {
      this.successMessage = 'Vehicle details saved successfully.';

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }

    // Setup profile menu
    this.setupProfileMenu();

    // Load dashboard data
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    try {
      // Load statistics from backend
      this.stats = await this.leaseService.getVendorStats(this.userEmail);

      // Load vendor vehicles from backend, fall back to localStorage if it fails
      try {
        console.log('🔍 Fetching vehicles for vendor email:', this.userEmail);
        this.myVehicles = await this.leaseService.getVendorVehiclesFromBackend(this.userEmail);
        console.log('✅ Vehicles loaded from backend:', this.myVehicles);
      } catch (e) {
        console.error('❌ Failed to load vendor vehicles from backend, falling back to local data:', e);
        this.myVehicles = this.leaseService.getVehiclesByVendor(this.userEmail) as any;
      }
      
      // Load vendor's quotations and pending requests
      if (this.vendorId) {
        await this.loadMyQuotations();
        
        // Load pending requests from backend (excludes requests already quoted by this vendor)
        try {
          this.pendingRequests = await this.leaseService.getPendingRequestsForVendor(this.vendorId);
          this.stats.pendingRequests = this.pendingRequests.length;
        } catch (e) {
          console.error('Failed to load pending requests for vendor:', e);
          // Fallback to all pending requests
          this.pendingRequests = await this.leaseService.getPendingRequests();
        }
        
        // Load approved quotations count
        try {
          this.stats.approvedRequests = await this.quotationService.getVendorApprovedCount(this.vendorId);
        } catch (e) {
          console.error('Failed to load approved count:', e);
        }
      } else {
        // Fallback if no vendorId
        this.pendingRequests = await this.leaseService.getPendingRequests();
      }
      
      console.log('✅ Vendor dashboard data loaded:', {
        stats: this.stats,
        pendingRequests: this.pendingRequests.length,
        vehicles: this.myVehicles.length,
        quotations: this.myQuotations.length
      });
    } catch (error) {
      console.error('❌ Error loading vendor dashboard data:', error);
      this.stats = {
        totalVehicles: 0,
        availableVehicles: 0,
        leasedVehicles: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalRevenue: 0
      };
      this.pendingRequests = [];
      this.myVehicles = [];
    }
  }

  async respondToRequest(request: LeaseRequest): Promise<void> {
    this.selectedRequest = request;
    // Calculate average budget for quotation
    const avgBudget = (request.minBudget + request.maxBudget) / 2;
    
    // Fetch next quotation number from backend
    let quotationNumber = '';
    try {
      quotationNumber = await this.quotationService.getNextQuotationNumber();
    } catch (error) {
      console.error('Failed to get quotation number from backend:', error);
      // Fallback to client-generated number
      quotationNumber = 'Q-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 900) + 100);
    }
    
    // Get company name from request.company object or fallback
    const companyName = request.company?.name || request.companyName || 'Company';
    
    // Prefill quotation defaults based on request
    this.quotation = {
      requestedBy: companyName,
      quotedBy: this.companyName || this.userName,
      quotationNumber: quotationNumber,
      quotationDate: new Date().toISOString().substring(0, 10),
      validUntil: '',
      monthlyRent: avgBudget,
      leaseTenure: request.leaseDuration,
      startDate: '', // Company can specify in quotation
      notes: '',
      itemDescription: `${request.vehicleType}${request.preferredModel ? ' - ' + request.preferredModel : ''} lease`,
      itemQuantity: 1, // Default to 1 vehicle
      itemUnitPrice: avgBudget,
      taxPercent: 0,
      vendorGst: '',
      vendorAddress: '',
      terms: '',
    };
    this.showResponseForm = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  closeResponseForm(): void {
    this.showResponseForm = false;
    this.selectedRequest = null;
    // reset quotation state
    this.quotation = {
      requestedBy: '',
      quotedBy: '',
      quotationNumber: '',
      quotationDate: '',
      validUntil: '',
      monthlyRent: null,
      leaseTenure: null,
      startDate: '',
      notes: '',
      itemDescription: '',
      itemQuantity: null,
      itemUnitPrice: null,
      taxPercent: 0,
      vendorGst: '',
      vendorAddress: '',
      terms: '',
    };
  }

  async submitQuotation(): Promise<void> {
    if (!this.selectedRequest) return;

    this.isProcessing = true;
    this.errorMessage = '';

    // Basic validation: ensure key fields are filled
    if (!this.quotation.quotationDate || !this.quotation.validUntil ||
        !this.quotation.itemDescription || this.quotation.itemQuantity == null ||
        this.quotation.itemUnitPrice == null) {
      this.isProcessing = false;
      this.errorMessage = 'Please fill all required quotation fields before submitting.';
      return;
    }
    
    // Validate quotation date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (this.quotation.quotationDate < today) {
      this.isProcessing = false;
      this.errorMessage = 'Quotation date cannot be in the past.';
      return;
    }
    
    // Validate valid until date is after quotation date
    if (this.quotation.validUntil <= this.quotation.quotationDate) {
      this.isProcessing = false;
      this.errorMessage = 'Valid Until date must be after the Quotation Date.';
      return;
    }

    // Get lease request ID
    const leaseRequestId = this.selectedRequest.id;
    if (!leaseRequestId) {
      this.isProcessing = false;
      this.errorMessage = 'Invalid lease request ID';
      return;
    }

    // Build quotation submission DTO
    const quotationDTO: QuotationSubmitDTO = {
      leaseRequestId: leaseRequestId,
      vendorEmail: this.userEmail,
      quoteDate: this.quotation.quotationDate,
      validUntil: this.quotation.validUntil,
      itemDescription: this.quotation.itemDescription,
      itemQuantity: this.quotation.itemQuantity || 1,
      unitPrice: this.quotation.itemUnitPrice || 0,
      taxPercent: this.quotation.taxPercent || 0,
      termsAndConditions: this.quotation.terms || ''
    };

    try {
      // Submit quotation to backend
      console.log('📤 Submitting quotation:', quotationDTO);
      const response = await this.quotationService.submitQuotation(quotationDTO);
      
      if (response.success) {
        this.isProcessing = false;
        this.successMessage = `✅ Quotation ${response.quotationNumber} saved successfully! Email notification sent to company.`;
        
        // Refresh My Quotations list
        await this.loadMyQuotations();
        
        // Show My Quotes section to display the new quotation
        this.showMyQuotes = true;
        
        // Close form after delay
        setTimeout(() => {
          this.closeResponseForm();
          this.successMessage = '';
        }, 4000);
      } else {
        this.isProcessing = false;
        this.errorMessage = '❌ ' + (response.message || 'Failed to save quotation.');
      }
    } catch (error: any) {
      this.isProcessing = false;
      console.error('❌ Failed to submit quotation:', error);
      this.errorMessage = '❌ ' + (error?.error?.message || error?.message || 'Failed to save quotation. Please try again.');
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openIncomingRequestsQuickAction(): void {
    this.showIncomingRequestsSection = !this.showIncomingRequestsSection;

    if (this.showIncomingRequestsSection) {
      this.scrollToSection('incoming-requests');
    }
  }

  openAddVehicleQuickAction(): void {
    if (!this.showAddVehicleSection) {
      this.showAddVehicleSection = true;
    }
    this.scrollToSection('add-vehicle-section');
  }

  // ===== Add New Vehicle section methods =====

  toggleAddVehicleSection(): void {
    this.showAddVehicleSection = !this.showAddVehicleSection;
    this.lookupError = '';
  }

  fetchVehicleDetails(): void {
    this.lookupError = '';
    this.lookedUpVehicle = null;

    if (!this.newVehicleNumber || !this.newOwnerName) {
      this.lookupError = 'Please enter both vehicle number and owner name.';
      return;
    }

    this.lookupLoading = true;
    this.vehicleLookupService
      .lookupByRegistration(this.newVehicleNumber, this.newOwnerName)
      .then(result => {
        this.lookupLoading = false;
        this.lookedUpVehicle = result;

        // Save full details (including extended fields) into flow service and navigate to details page
        this.vehicleFlow.setDetails({
          ...result
        });

        this.router.navigate(['/vendor/vehicle-details']);
      })
      .catch(error => {
        console.error('Vehicle lookup failed:', error);
        this.lookupLoading = false;
        const backendMessage =
          error?.error?.['catch block error'] ||
          error?.error?.error ||
          error?.message;

        this.lookupError = backendMessage || 'Failed to fetch vehicle details. Please try again or fill details manually.';
      });
  }

  onRcFrontSelected(event: any): void {
    const file = event?.target?.files?.[0];
    this.rcFrontFileName = file ? file.name : '';
  }

  onRcBackSelected(event: any): void {
    const file = event?.target?.files?.[0];
    this.rcBackFileName = file ? file.name : '';
  }

  submitNewVehicle(): void {
    this.lookupError = '';

    if (!this.newVehicleNumber || !this.newOwnerName) {
      this.lookupError = 'Please enter vehicle number and owner name before submitting.';
      return;
    }

    console.log('Submitting new vehicle:', {
      registrationNumber: this.newVehicleNumber,
      ownerName: this.newOwnerName,
      details: this.lookedUpVehicle,
      rcFrontFileName: this.rcFrontFileName,
      rcBackFileName: this.rcBackFileName,
    });

    this.successMessage = 'Vehicle submitted successfully.';
    this.errorMessage = '';

    // Reset form fields
    this.newVehicleNumber = '';
    this.newOwnerName = '';
    this.lookedUpVehicle = null;
    this.rcFrontFileName = '';
    this.rcBackFileName = '';
  }

  setupProfileMenu(): void {
    this.profileMenuItems = [
      { icon: 'fa-user-circle', label: 'Account Details', action: 'account' },
      { icon: 'fa-clipboard-list', label: 'Available Requests', action: 'requests', badge: this.stats.pendingRequests },
      { icon: 'fa-file-invoice-dollar', label: 'My Quotes', action: 'quotes', badge: this.stats.approvedRequests },
      { icon: 'fa-car', label: 'Vehicles', action: 'vehicles', badge: this.stats.totalVehicles }
    ];
  }

  onProfileMenuClick(action: string): void {
    // Close all sections first
    this.showAccountDetails = false;
    this.showAddVehicleSection = false;
    this.showMyVehicles = false;
    this.showMyQuotes = false;

    // Open requested section
    switch (action) {
      case 'account':
        this.showAccountDetails = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'requests':
        // Scroll to pending requests section
        window.scrollTo({ top: 600, behavior: 'smooth' });
        break;
      case 'quotes':
        this.showMyQuotes = true;
        this.loadMyQuotations(); // Auto-load quotations
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'vehicles':
        this.showMyVehicles = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
    }
  }

  closeAccountDetails(): void {
    this.showAccountDetails = false;
  }

  closeMyVehicles(): void {
    this.showMyVehicles = false;
  }

  closeMyQuotes(): void {
    this.showMyQuotes = false;
  }

  // Load vendor's submitted quotations
  async loadMyQuotations(): Promise<void> {
    if (!this.vendorId) {
      console.error('Vendor ID not available');
      return;
    }
    
    this.quotationsLoading = true;
    try {
      this.myQuotations = await this.quotationService.getQuotationsByVendor(this.vendorId);
      console.log('✅ Loaded vendor quotations:', this.myQuotations.length);
    } catch (error) {
      console.error('❌ Failed to load vendor quotations:', error);
      this.myQuotations = [];
    } finally {
      this.quotationsLoading = false;
    }
  }

  // Download quotation PDF
  async downloadQuotationPdf(quotationId: number): Promise<void> {
    // Find the quotation to get the quotation number for filename
    const quotation = this.myQuotations.find(q => q.id === quotationId);
    const quotationNumber = quotation?.quotationNumber || `Q-${quotationId}`;
    
    try {
      await this.quotationService.downloadQuotationPdf(quotationId, quotationNumber);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  }

  // Check if vendor has already submitted a quotation for this lease request
  hasQuotationForRequest(requestId: number | undefined): boolean {
    if (!requestId) return false;
    return this.myQuotations.some(q => q.leaseRequest?.id === requestId);
  }

  // Get the quotation for a specific lease request (if exists)
  getQuotationForRequest(requestId: number | undefined): any {
    if (!requestId) return null;
    return this.myQuotations.find(q => q.leaseRequest?.id === requestId);
  }

  // Check if a quotation is expired (validUntil date has passed)
  isQuotationExpired(requestId: number | undefined): boolean {
    const quotation = this.getQuotationForRequest(requestId);
    if (!quotation || !quotation.validUntil) return false;
    const validUntil = new Date(quotation.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return validUntil < today;
  }

  logout(): void {
    this.authService.logout();
  }
}
