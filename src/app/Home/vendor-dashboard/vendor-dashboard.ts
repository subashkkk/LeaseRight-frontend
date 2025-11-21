import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';
import { LeaseRequestService, LeaseRequest, Vehicle } from '../../services/lease-request.service';
import { VehicleLookupService, VehicleLookupResult } from '../../services/vehicle-lookup.service';
import { VehicleFlowService } from '../../services/vehicle-flow.service';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-dashboard.html',
  styleUrls: ['./vendor-dashboard.css'],
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

  // Add New Vehicle section state
  showAddVehicleSection: boolean = false;
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
    leaseTenure: number | null;
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private leaseService: LeaseRequestService,
    private vehicleLookupService: VehicleLookupService,
    private vehicleFlow: VehicleFlowService
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

  async loadDashboardData(): Promise<void> {
    try {
      // Load statistics from backend
      this.stats = await this.leaseService.getVendorStats(this.userEmail);

      // Load pending requests from backend (all requests - vendors see all)
      this.pendingRequests = await this.leaseService.getPendingRequests();

      // Load my vehicles (still using localStorage for now)
      this.myVehicles = this.leaseService.getVehiclesByVendor(this.userEmail);
      
      console.log('✅ Vendor dashboard data loaded:', {
        stats: this.stats,
        pendingRequests: this.pendingRequests.length,
        vehicles: this.myVehicles.length
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

  respondToRequest(request: LeaseRequest): void {
    this.selectedRequest = request;
    // Calculate average budget for quotation
    const avgBudget = (request.minBudget + request.maxBudget) / 2;
    
    // Prefill quotation defaults based on request
    this.quotation = {
      requestedBy: request.companyName || 'Company',
      quotedBy: this.companyName || this.userName,
      quotationNumber: 'Q-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 900) + 100),
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

  submitQuotation(): void {
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

    // Compute line totals
    const qty = this.quotation.itemQuantity || 0;
    const unit = this.quotation.itemUnitPrice || 0;
    const lineTotal = qty * unit;
    const subtotal = lineTotal;
    const taxAmount = subtotal * (this.quotation.taxPercent / 100);
    const grandTotal = subtotal + taxAmount;

    // Build a human-readable quotation summary that the company can see
    const summaryParts: string[] = [];
    summaryParts.push(`Requested by: ${this.quotation.requestedBy}`);
    summaryParts.push(`Quoted by: ${this.quotation.quotedBy}`);
    if (this.quotation.quotationNumber) {
      summaryParts.push(`Q.No: ${this.quotation.quotationNumber}`);
    }
    if (this.quotation.quotationDate) {
      summaryParts.push(`Q.Date: ${this.quotation.quotationDate}`);
    }
    if (this.quotation.validUntil) {
      summaryParts.push(`Valid until: ${this.quotation.validUntil}`);
    }
    if (this.quotation.monthlyRent != null) {
      summaryParts.push(`Quoted rent: $${this.quotation.monthlyRent}/month`);
    }
    if (this.quotation.leaseTenure != null) {
      summaryParts.push(`Tenure: ${this.quotation.leaseTenure} months`);
    }
    if (this.quotation.startDate) {
      summaryParts.push(`Start: ${this.quotation.startDate}`);
    }
    if (this.quotation.itemDescription) {
      summaryParts.push(`Item: ${this.quotation.itemDescription} | Qty: ${qty} | Unit: $${unit}/month | Line total: $${lineTotal.toFixed(2)}`);
    }
    summaryParts.push(`Subtotal: $${subtotal.toFixed(2)} | Tax (${this.quotation.taxPercent}%): $${taxAmount.toFixed(2)} | Total: $${grandTotal.toFixed(2)}`);
    if (this.quotation.terms) {
      summaryParts.push(`Terms: ${this.quotation.terms}`);
    }

    const quotationSummary = summaryParts.join(' | ');
    const fullResponse = quotationSummary || 'Request approved. We will contact you soon!';

    // Convert id to string for updateRequestStatus
    const requestId = this.selectedRequest.id ? String(this.selectedRequest.id) : '';
    
    if (!requestId) {
      this.isProcessing = false;
      this.errorMessage = 'Invalid request ID';
      return;
    }

    this.leaseService
      .updateRequestStatus(
        requestId,
        'approved',
        fullResponse
      )
      .then(() => {
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

        // Save into flow service and navigate to details page
        this.vehicleFlow.setDetails({
          registrationNumber: result.registrationNumber,
          ownerName: result.ownerName,
          make: result.make || '',
          model: result.model || '',
          fuelType: result.fuelType || '',
          registrationDate: result.registrationDate || ''
        });

        this.router.navigate(['/vendor/vehicle-details']);
      })
      .catch(error => {
        console.error('Vehicle lookup failed:', error);
        this.lookupLoading = false;
        this.lookupError = 'Failed to fetch vehicle details. Please try again or fill details manually.';
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

  logout(): void {
    this.authService.logout();
  }
}
