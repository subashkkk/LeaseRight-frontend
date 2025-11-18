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
    // Prefill quotation defaults based on request
    this.quotation = {
      requestedBy: request.companyName,
      quotedBy: this.companyName || this.userName,
      quotationNumber: 'Q-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 900) + 100),
      quotationDate: new Date().toISOString().substring(0, 10),
      validUntil: '',
      monthlyRent: request.budget,
      leaseTenure: request.leaseDuration,
      startDate: request.startDate,
      notes: '',
      itemDescription: `${request.vehicleType} lease`,
      itemQuantity: request.quantity,
      itemUnitPrice: request.budget,
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

    this.leaseService
      .updateRequestStatus(
        this.selectedRequest.id,
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

  logout(): void {
    this.authService.logout();
  }
}
