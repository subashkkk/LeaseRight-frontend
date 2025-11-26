import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { API_CONFIG, getApiUrl, replaceUrlParams } from '../config/api.config';

// DTO for submitting quotation to backend
export interface QuotationSubmitDTO {
  leaseRequestId: number;
  vendorEmail: string;
  quoteDate: string;  // ISO date string YYYY-MM-DD
  validUntil: string; // ISO date string YYYY-MM-DD
  itemDescription: string;
  itemQuantity: number;
  unitPrice: number;
  taxPercent: number;
  termsAndConditions: string;
}

// Response from backend after submission
export interface QuotationSubmitResponse {
  success: boolean;
  message: string;
  quotationNumber?: string;
  quotationId?: number;
}

// Quotation entity from backend
export interface BackendQuotation {
  id: number;
  quotationNumber: string;
  quoteDate: string;
  validUntil: string;
  status: string;  // PENDING, APPROVED, REJECTED
  requestedBy?: {
    id: number;
    name: string;
    mail: string;
    contactNo: string;
    gstNo: string;
  };
  vendor?: {
    id: number;
    name: string;
    mail: string;
    contactNo: string;
    gstNo: string;
  };
  leaseRequest?: {
    id: number;
    vehicleType: string;
    preferredModel: string;
    leaseDuration: string;
    minBudget: number;
    maxBudget: number;
  };
  itemDescription: string;
  itemQuantity: number;
  unitPrice: number;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  termsAndConditions: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorQuotationService {

  constructor(private http: HttpClient) { }

  /**
   * Get next quotation number from backend
   */
  async getNextQuotationNumber(): Promise<string> {
    const url = getApiUrl(API_CONFIG.QUOTATION.GET_NEXT_NUMBER);
    try {
      const response = await firstValueFrom(
        this.http.get<{ quotationNumber: string }>(url)
      );
      return response.quotationNumber;
    } catch (error) {
      console.error('Failed to get next quotation number:', error);
      // Fallback to client-generated number
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 900) + 100;
      return `Q-${year}-${random}`;
    }
  }

  /**
   * Submit quotation to backend
   */
  async submitQuotation(dto: QuotationSubmitDTO): Promise<QuotationSubmitResponse> {
    const url = getApiUrl(API_CONFIG.QUOTATION.SUBMIT);
    console.log('📤 Submitting quotation to:', url, dto);
    
    return firstValueFrom(
      this.http.post<QuotationSubmitResponse>(url, dto)
    );
  }

  /**
   * Get quotations received by a company
   */
  async getQuotationsByCompany(companyId: number): Promise<BackendQuotation[]> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.GET_BY_COMPANY, { companyId }));
    return firstValueFrom(this.http.get<BackendQuotation[]>(url));
  }

  /**
   * Get quotations sent by a vendor
   */
  async getQuotationsByVendor(vendorId: number): Promise<BackendQuotation[]> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.GET_BY_VENDOR, { vendorId }));
    return firstValueFrom(this.http.get<BackendQuotation[]>(url));
  }

  /**
   * Get quotations for a specific lease request
   */
  async getQuotationsForLeaseRequest(leaseRequestId: number): Promise<BackendQuotation[]> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.GET_BY_LEASE_REQUEST, { leaseRequestId }));
    return firstValueFrom(this.http.get<BackendQuotation[]>(url));
  }

  /**
   * Get quotation PDF download URL
   */
  getQuotationPdfUrl(quotationId: number): string {
    return getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.GET_PDF, { id: quotationId }));
  }

  /**
   * Download quotation PDF with authentication
   * This method fetches the PDF as a blob and triggers download
   */
  async downloadQuotationPdf(quotationId: number, quotationNumber: string): Promise<void> {
    const url = this.getQuotationPdfUrl(quotationId);
    console.log('📥 Downloading PDF from:', url);
    
    try {
      const blob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );
      
      // Create a download link and trigger it
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `quotation_${quotationNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download PDF:', error);
      throw error;
    }
  }

  /**
   * Approve a quotation
   */
  async approveQuotation(quotationId: number): Promise<{ success: boolean; message: string }> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.APPROVE, { id: quotationId }));
    console.log('✅ Approving quotation:', url);
    return firstValueFrom(this.http.put<{ success: boolean; message: string }>(url, {}));
  }

  /**
   * Reject a quotation
   */
  async rejectQuotation(quotationId: number): Promise<{ success: boolean; message: string }> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.REJECT, { id: quotationId }));
    console.log('❌ Rejecting quotation:', url);
    return firstValueFrom(this.http.put<{ success: boolean; message: string }>(url, {}));
  }

  /**
   * Get approved quotations count for a vendor
   */
  async getVendorApprovedCount(vendorId: number): Promise<number> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.QUOTATION.VENDOR_APPROVED_COUNT, { vendorId }));
    const response = await firstValueFrom(this.http.get<{ count: number }>(url));
    return response.count;
  }
}
