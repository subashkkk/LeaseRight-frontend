import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorQuotationService, BackendQuotation } from '../../services/vendor-quotation.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

type QuotationStatus = 'pending' | 'accepted' | 'rejected';

@Component({
  selector: 'app-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './quotations.html',
  styleUrls: ['./quotations.css']
  // NOTE: Do NOT provide VendorQuotationService here - use the root-level service
  // to ensure the auth interceptor is applied
})
export class QuotationsComponent implements OnInit, OnChanges {
  @Input() companyId: number = 0;  // Company ID passed from parent
  
  quotations: BackendQuotation[] = [];
  filteredQuotations: BackendQuotation[] = [];
  isLoading = false;
  isApproving = false;
  error: string | null = null;
  successMessage: string | null = null;
  searchTerm = '';
  statusFilter: 'all' | QuotationStatus = 'all';
  selectedQuotation: BackendQuotation | null = null;
  
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
    console.log('🚀 QuotationsComponent ngOnInit - companyId:', this.companyId);
    // Auto-load if companyId is already set
    if (this.companyId) {
      this.loadQuotations();
    } else {
      console.warn('⚠️ ngOnInit: companyId is not set yet');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 QuotationsComponent ngOnChanges:', changes);
    // Auto-load when companyId changes
    if (changes['companyId'] && this.companyId) {
      console.log('📥 companyId changed to:', this.companyId);
      this.loadQuotations();
    }
  }

  async loadQuotations(): Promise<void> {
    console.log('🔄 loadQuotations called with companyId:', this.companyId);
    
    if (!this.companyId) {
      this.error = 'Company ID not provided';
      console.error('❌ Company ID is missing or zero');
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      console.log('📡 Calling API: getQuotationsByCompany(' + this.companyId + ')');
      // Fetch quotations from backend API
      this.quotations = await this.quotationService.getQuotationsByCompany(this.companyId);
      console.log('📦 Raw API response:', this.quotations);
      this.applyFilters();
      this.isLoading = false;
      console.log('✅ Quotations loaded from API:', this.quotations.length);
    } catch (err: any) {
      this.error = 'Failed to load quotations. Please try again later.';
      this.isLoading = false;
      console.error('❌ Error loading quotations:', err);
      console.error('❌ Error details:', err?.message, err?.status, err?.error);
    }
  }
  
  // Check if a quotation is expiring soon (within 7 days)
  isExpiringSoon(validUntil: string | Date): boolean {
    if (!validUntil) return false;
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }

  // Check if a quotation has expired (validUntil date has passed)
  isExpired(validUntil: string | Date): boolean {
    if (!validUntil) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(validUntil);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  }

  // Calculate total amount for a quotation
  getTotalAmount(quotation: BackendQuotation): number {
    return quotation?.totalAmount || 0;
  }

  // Apply filters based on search term
  applyFilters(): void {
    if (!this.quotations) {
      this.filteredQuotations = [];
      return;
    }
    
    const searchTerm = this.searchTerm ? this.searchTerm.toLowerCase() : '';
    
    this.filteredQuotations = this.quotations.filter(quote => {
      const matchesSearch = searchTerm === '' || 
                          (quote.quotationNumber && quote.quotationNumber.toLowerCase().includes(searchTerm)) ||
                          (quote.vendor?.name && quote.vendor.name.toLowerCase().includes(searchTerm)) ||
                          (quote.leaseRequest?.id && String(quote.leaseRequest.id).includes(searchTerm));
      
      // For now, all quotations are considered 'pending' since we don't have status field
      const matchesStatus = this.statusFilter === 'all';
      
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
  viewQuotation(quotation: BackendQuotation): void {
    this.selectedQuotation = quotation;
    console.log('Viewing quotation:', quotation);
  }
  
  // Download PDF report
  async downloadPdf(quotation: BackendQuotation): Promise<void> {
    try {
      await this.quotationService.downloadQuotationPdf(quotation.id, quotation.quotationNumber);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
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
  get paginatedQuotations(): BackendQuotation[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredQuotations.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Refresh quotations (force reload)
  refreshQuotations(): void {
    this.loadQuotations();
  }

  // Approve a quotation
  async approveQuotation(quotation: BackendQuotation): Promise<void> {
    if (this.isApproving) return;
    
    this.isApproving = true;
    this.error = null;
    this.successMessage = null;
    
    try {
      const response = await this.quotationService.approveQuotation(quotation.id);
      console.log('✅ Quotation approved:', response);
      
      // Update the quotation status locally
      quotation.status = 'APPROVED';
      
      // Update in arrays
      const updateStatus = (q: BackendQuotation) => {
        if (q.id === quotation.id) {
          q.status = 'APPROVED';
        }
        return q;
      };
      this.quotations = this.quotations.map(updateStatus);
      this.filteredQuotations = this.filteredQuotations.map(updateStatus);
      
      // Update selected quotation if viewing
      if (this.selectedQuotation?.id === quotation.id) {
        this.selectedQuotation.status = 'APPROVED';
      }
      
      this.successMessage = `Quotation ${quotation.quotationNumber} approved successfully! Email sent to vendor.`;
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);
      
    } catch (err: any) {
      console.error('❌ Failed to approve quotation:', err);
      this.error = 'Failed to approve quotation. Please try again.';
    } finally {
      this.isApproving = false;
    }
  }
}
