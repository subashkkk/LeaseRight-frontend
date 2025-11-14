import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorQuotationService, Quotation } from '../../services/vendor-quotation.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

type QuotationStatus = 'pending' | 'accepted' | 'rejected';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, DatePipe],
  templateUrl: './quotations.html',
  styleUrls: ['./quotations.css'],
  providers: [VendorQuotationService]
})
export class QuotationsComponent implements OnInit {
  quotations: Quotation[] = [];
  filteredQuotations: Quotation[] = [];
  isLoading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter: 'all' | QuotationStatus = 'all';
  selectedQuotation: Quotation | null = null;
  
  // Status options for filter
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  // View mode (list or grid)
  viewMode: 'list' | 'grid' = 'list';

  constructor(private quotationService: VendorQuotationService) {}

  ngOnInit(): void {
    this.loadQuotations();
    // Initialize with mock data for now
    this.quotations = this.getMockQuotations();
    this.filteredQuotations = [...this.quotations]; // Initialize filteredQuotations with all quotations
  }

  loadQuotations(): void {
    this.isLoading = true;
    // In a real app, this would be an API call
    // For now, we'll use mock data
    setTimeout(() => {
      this.quotations = this.getMockQuotations();
      this.applyFilters();
      this.isLoading = false;
    }, 1000);
    
    // Real implementation would look like:
    /*
    this.quotationService.getQuotations().subscribe({
      next: (data) => {
        this.quotations = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load quotations. Please try again later.';
        this.isLoading = false;
        console.error('Error loading quotations:', err);
      }
    });
    */
  }
  
  // Check if a quotation is expiring soon (within 7 days)
  isExpiringSoon(validUntil: Date): boolean {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }

  // Mock data for demonstration
  private getMockQuotations(): Quotation[] {
    return [
      {
        id: 'QUO-001',
        serialNo: 1,
        quotationNumber: 'Q-2023-001',
        quotationDate: new Date('2023-11-01'),
        vendorId: 'VEND-001',
        vendorName: 'ABC Car Rentals',
        vendorEmail: 'contact@abccarrentals.com',
        vendorPhone: '+91 9876543210',
        requestId: 'REQ-2023-001',
        monthlyRent: 25000,
        leaseTenure: 36,
        status: 'pending',
        submittedDate: new Date('2023-11-01'),
        validUntil: new Date('2023-12-01'),
        notes: 'Includes free maintenance for first year',
        carDetails: {
          brand: 'Toyota',
          model: 'Innova Crysta',
          year: 2023,
          color: 'White',
          registrationNumber: 'KA01AB1234',
          seatingCapacity: 7,
          transmissionType: 'automatic',
          fuelType: 'Diesel',
          mileage: 15.5,
          insuranceDetails: 'Comprehensive insurance with zero depreciation'
        },
        documents: {
          rcBook: 'https://example.com/rc.pdf',
          insurance: 'https://example.com/insurance.pdf',
          pollutionCertificate: 'https://example.com/pollution.pdf'
        },
        items: [
          { id: '1', description: 'Monthly Rent', quantity: 1, unitPrice: 25000, total: 25000, type: 'vehicle' },
          { id: '2', description: 'Insurance', quantity: 1, unitPrice: 1500, total: 1500, type: 'service' },
          { id: '3', description: 'Maintenance', quantity: 1, unitPrice: 2000, total: 2000, type: 'service' }
        ]
      },
      {
        id: 'QUO-002',
        serialNo: 2,
        quotationNumber: 'Q-2023-002',
        quotationDate: new Date('2023-10-25'),
        vendorId: 'VEND-002',
        vendorName: 'XYZ Office Solutions',
        vendorEmail: 'sales@xyzos.com',
        vendorPhone: '+91 9876500000',
        requestId: 'REQ-2023-002',
        monthlyRent: 18000,
        leaseTenure: 24,
        status: 'accepted',
        submittedDate: new Date('2023-10-25'),
        validUntil: new Date('2023-11-25'),
        notes: 'Includes complimentary basic service package.',
        carDetails: {
          brand: 'Hyundai',
          model: 'Creta',
          year: 2022,
          color: 'Silver',
          registrationNumber: 'KA02CD5678',
          seatingCapacity: 5,
          transmissionType: 'manual',
          fuelType: 'Petrol',
          mileage: 17,
          insuranceDetails: 'Standard comprehensive insurance'
        },
        documents: {
          rcBook: 'https://example.com/creta-rc.pdf',
          insurance: 'https://example.com/creta-insurance.pdf',
          pollutionCertificate: 'https://example.com/creta-pollution.pdf'
        },
        items: [
          { id: '4', description: 'Monthly Rent', quantity: 1, unitPrice: 18000, total: 18000, type: 'vehicle' },
          { id: '5', description: 'Basic Service Package', quantity: 1, unitPrice: 1200, total: 1200, type: 'service' }
        ]
      },
      {
        id: 'QUO-003',
        serialNo: 3,
        quotationNumber: 'Q-2023-003',
        quotationDate: new Date('2023-10-20'),
        vendorId: 'VEND-003',
        vendorName: 'Modern Office Ltd',
        vendorEmail: 'info@modernoffice.com',
        vendorPhone: '+91 9845012345',
        requestId: 'REQ-2023-003',
        monthlyRent: 30000,
        leaseTenure: 48,
        status: 'rejected',
        submittedDate: new Date('2023-10-20'),
        validUntil: new Date('2023-11-20'),
        notes: 'Quote exceeds budget.',
        carDetails: {
          brand: 'Mahindra',
          model: 'XUV700',
          year: 2023,
          color: 'Black',
          registrationNumber: 'KA03EF9012',
          seatingCapacity: 7,
          transmissionType: 'automatic',
          fuelType: 'Diesel',
          mileage: 16,
          insuranceDetails: 'Premium insurance with roadside assistance'
        },
        documents: {
          rcBook: 'https://example.com/xuv700-rc.pdf',
          insurance: 'https://example.com/xuv700-insurance.pdf',
          pollutionCertificate: 'https://example.com/xuv700-pollution.pdf'
        },
        items: [
          { id: '6', description: 'Monthly Rent', quantity: 1, unitPrice: 30000, total: 30000, type: 'vehicle' },
          { id: '7', description: 'Premium Support', quantity: 1, unitPrice: 2500, total: 2500, type: 'service' }
        ]
      }
    ];
  }

  // Calculate total amount for a quotation based on its items
  getTotalAmount(quotation: Quotation): number {
    if (!quotation || !quotation.items) {
      return 0;
    }
    return quotation.items.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  // Apply filters based on search term and status
  applyFilters(): void {
    if (!this.quotations) {
      this.filteredQuotations = [];
      return;
    }
    
    const searchTerm = this.searchTerm ? this.searchTerm.toLowerCase() : '';
    
    this.filteredQuotations = this.quotations.filter(quote => {
      const matchesSearch = searchTerm === '' || 
                          (quote.id && quote.id.toLowerCase().includes(searchTerm)) ||
                          (quote.vendorName && quote.vendorName.toLowerCase().includes(searchTerm)) ||
                          (quote.requestId && quote.requestId.toLowerCase().includes(searchTerm));
      
      const matchesStatus = this.statusFilter === 'all' || quote.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    this.totalItems = this.filteredQuotations.length;
    this.currentPage = 1; // Reset to first page when filters change
  }
  
  // Handle search input
  onSearch(): void {
    this.applyFilters();
  }
  
  // Handle status filter change
  onStatusFilterChange(): void {
    this.applyFilters();
  }
  
  // Toggle view mode between list and grid
  toggleViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }
  
  // View quotation details
  viewQuotation(quotation: Quotation): void {
    this.selectedQuotation = quotation;
    // In a real app, you might want to open a modal or navigate to a details page
    console.log('Viewing quotation:', quotation);
  }
  
  // Generate PDF report
  generatePdfReport(quotation: Quotation): void {
    // In a real app, you would generate a PDF report
    console.log('Generating PDF report for:', quotation.quotationNumber);
    // You can use libraries like jsPDF or html2canvas to generate PDF
    // This is a placeholder for the actual implementation
    const pdfContent = `
      Quotation Report
      ===============
      
      Quotation #: ${quotation.quotationNumber}
      Date: ${quotation.quotationDate.toLocaleDateString()}
      Vendor: ${quotation.vendorName}
      
      Vehicle Details:
      ---------------
      ${quotation.carDetails.brand} ${quotation.carDetails.model} (${quotation.carDetails.year})
      Color: ${quotation.carDetails.color}
      Registration: ${quotation.carDetails.registrationNumber}
      Seating: ${quotation.carDetails.seatingCapacity} persons
      Transmission: ${quotation.carDetails.transmissionType}
      
      Lease Terms:
      -----------
      Monthly Rent: ₹${quotation.monthlyRent.toLocaleString()}
      Lease Tenure: ${quotation.leaseTenure} months
      
      Status: ${quotation.status.toUpperCase()}
    `;
    
    console.log('PDF Content:', pdfContent);
    // In a real implementation, you would open this in a new window or download it
    alert('PDF report would be generated here. Check console for details.');
  }
  
  // Close details view
  closeDetails(): void {
    this.selectedQuotation = null;
  }
  
  // Calculate total pages for pagination
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  // Get current page items
  get paginatedQuotations(): Quotation[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredQuotations.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  // Update quotation status
  onStatusChange(quotation: Quotation, status: QuotationStatus): void {
    // In a real app, this would be an API call
    const originalStatus = quotation.status;
    quotation.status = status;
    
    // Simulate API call
    this.quotationService.updateQuotationStatus(quotation.id || '', status).subscribe({
      next: (updatedQuotation) => {
        // Update the local quotations array
        const index = this.quotations.findIndex(q => q.id === updatedQuotation.id);
        if (index !== -1) {
          this.quotations[index] = updatedQuotation;
          this.applyFilters();
        }
      },
      error: (err) => {
        // Revert on error
        quotation.status = originalStatus;
        console.error('Error updating quotation status:', err);
        this.error = 'Failed to update quotation status. Please try again.';
        setTimeout(() => this.error = null, 5000);
      }
    });
  }
}
