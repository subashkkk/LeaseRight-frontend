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
  dataLoaded = false;
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
    // Don't load data automatically - wait for user action or parent component trigger
    // this.loadQuotations();
  }

  loadQuotations(): void {
    if (this.dataLoaded) return; // Prevent reloading
    
    this.isLoading = true;
    this.error = null;
    
    // Real API implementation
    this.quotationService.getQuotations().subscribe({
      next: (data) => {
        this.quotations = data;
        this.applyFilters();
        this.isLoading = false;
        this.dataLoaded = true;
        console.log('✅ Quotations loaded from API:', this.quotations.length);
      },
      error: (err) => {
        this.error = 'Failed to load quotations. Please try again later.';
        this.isLoading = false;
        this.dataLoaded = true;
        console.error('❌ Error loading quotations:', err);
      }
    });
  }
  
  // Check if a quotation is expiring soon (within 7 days)
  isExpiringSoon(validUntil: Date): boolean {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }

  // Removed mock data - now using real API calls only

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
