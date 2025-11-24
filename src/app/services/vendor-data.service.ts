import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { API_CONFIG, getApiUrl } from '../config/api.config';

export interface VendorData {
  // Optional personal name fields for backward compatibility
  firstName?: string;
  lastName?: string;

  // Core vendor/company details
  companyName: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
  panNumber?: string;
  password: string;
  role: string;
  registeredAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorDataService {
  // Toggle between backend API and LocalStorage
  private USE_BACKEND_API = false; // Set to true to use your backend
  
  private readonly STORAGE_KEY = 'vendor_registrations';

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Save vendor data
   * Uses backend API if USE_BACKEND_API is true, otherwise uses LocalStorage
   */
  saveVendorData(vendorData: VendorData): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        // Backend API implementation
        const url = getApiUrl(API_CONFIG.VENDOR.REGISTER);
        console.log(' Saving vendor via backend API:', url);
        
        this.http.post(url, vendorData).subscribe({
          next: (response: any) => {
            console.log(' Vendor saved to backend:', response);
            resolve(response);
          },
          error: (error) => {
            console.error(' Backend vendor save failed:', error);
            reject(error);
          }
        });
      } else {
        // LocalStorage fallback
        try {
          const existingData = this.getAllVendors();
          existingData.push(vendorData);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
          
          console.log(' Vendor data saved to LocalStorage');
          console.log(' Total vendors:', existingData.length);
          
          resolve({
            success: true,
            message: 'Vendor registration successful',
            data: vendorData
          });
        } catch (error) {
          console.error(' Error saving vendor data:', error);
          reject(error);
        }
      }
    });
  }

  /**
   * Get all vendors
   * Currently: Retrieves from LocalStorage
   * Future: Will send GET request to backend API
   */
  getAllVendors(): VendorData[] {
    // === CURRENT IMPLEMENTATION (LocalStorage) ===
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error retrieving vendors:', error);
      return [];
    }

    // === FUTURE IMPLEMENTATION (Backend API) ===
    // When backend is ready, replace above code with:
    /*
    return this.http.get<VendorData[]>(this.API_URL);
    */
  }

  /**
   * Get vendor by email
   * Currently: Searches LocalStorage
   * Future: Will send GET request to backend API
   */
  getVendorByEmail(email: string): VendorData | null {
    // === CURRENT IMPLEMENTATION (LocalStorage) ===
    const vendors = this.getAllVendors();
    return vendors.find(v => v.email === email) || null;

    // === FUTURE IMPLEMENTATION (Backend API) ===
    // When backend is ready, replace above code with:
    /*
    return this.http.get<VendorData>(`${this.API_URL}/${email}`);
    */
  }

  /**
   * Check if email already exists
   */
  isEmailRegistered(email: string): boolean {
    const vendor = this.getVendorByEmail(email);
    return vendor !== null;
  }

  /**
   * Get all vendors as JSON string (for export/backup purposes)
   */
  exportVendorsAsJson(): string {
    const vendors = this.getAllVendors();
    return JSON.stringify(vendors, null, 2);
  }

  /**
   * Import vendors from JSON string (for restore/import purposes)
   */
  importVendorsFromJson(jsonString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const vendors = JSON.parse(jsonString);
        if (Array.isArray(vendors)) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(vendors));
          console.log('✅ Vendors imported successfully');
          resolve({ success: true, count: vendors.length });
        } else {
          reject({ error: 'Invalid JSON format' });
        }
      } catch (error) {
        console.error('❌ Error importing vendors:', error);
        reject(error);
      }
    });
  }

  /**
   * Clear all vendor data (for testing purposes)
   */
  clearAllVendors(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All vendor data cleared from LocalStorage');
  }

  /**
   * Get total number of registered vendors
   */
  getTotalVendors(): number {
    return this.getAllVendors().length;
  }
}
