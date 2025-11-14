import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Quotation {
  id?: string;
  serialNo: number;
  quotationNumber: string;
  quotationDate: Date;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  requestId: string;
  monthlyRent: number;
  leaseTenure: number; // in months
  status: 'pending' | 'accepted' | 'rejected';
  submittedDate: Date;
  validUntil: Date;
  notes?: string;
  items: QuotationItem[];
  // Additional fields for car details
  carDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
    registrationNumber: string;
    seatingCapacity: number;
    transmissionType: 'automatic' | 'manual';
    fuelType: string;
    mileage: number;
    insuranceDetails: string;
  };
  // Additional documents
  documents: {
    rcBook: string;
    insurance: string;
    pollutionCertificate: string;
  };
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'vehicle' | 'accessory' | 'service';
}

@Injectable({
  providedIn: 'root'
})
export class VendorQuotationService {
  private apiUrl = 'api/quotations'; // Update with your actual API endpoint

  constructor(private http: HttpClient) { }

  // Get all quotations
  getQuotations(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(this.apiUrl);
  }

  // Get quotation by ID
  getQuotationById(id: string): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.apiUrl}/${id}`);
  }

  // Get quotations by vendor ID
  getQuotationsByVendor(vendorId: string): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(`${this.apiUrl}/vendor/${vendorId}`);
  }

  // Create new quotation
  createQuotation(quotation: Omit<Quotation, 'id'>): Observable<Quotation> {
    return this.http.post<Quotation>(this.apiUrl, quotation);
  }

  // Update existing quotation
  updateQuotation(id: string, quotation: Partial<Quotation>): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.apiUrl}/${id}`, quotation);
  }

  // Delete quotation
  deleteQuotation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Update quotation status
  updateQuotationStatus(id: string, status: 'accepted' | 'rejected' | 'pending'): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.apiUrl}/${id}/status`, { status });
  }
}
