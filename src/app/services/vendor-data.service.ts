import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http'; // Uncomment when backend is ready
// import { Observable } from 'rxjs'; // Uncomment when backend is ready

export interface VendorData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  password: string;
  role: string;
  registeredAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorDataService {
  private readonly STORAGE_KEY = 'vendor_registrations';
  // private readonly API_URL = 'http://localhost:3000/api/vendors'; // Your backend API URL

  constructor(
    // private http: HttpClient // Uncomment when backend is ready
  ) {}

  /**
   * Save vendor data
   * Currently: Saves to LocalStorage
   * Future: Will send POST request to backend API
   */
  saveVendorData(vendorData: VendorData): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // === CURRENT IMPLEMENTATION (LocalStorage) ===
        const existingData = this.getAllVendors();
        existingData.push(vendorData);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
        
        console.log('✅ Vendor data saved to LocalStorage:', vendorData);
        resolve({ success: true, message: 'Vendor registered successfully' });

        // === FUTURE IMPLEMENTATION (Backend API) ===
        // When backend is ready, replace above code with:
        /*
        this.http.post(this.API_URL, vendorData).subscribe({
          next: (response) => {
            console.log('✅ Vendor data saved to backend:', response);
            resolve(response);
          },
          error: (error) => {
            console.error('❌ Error saving to backend:', error);
            reject(error);
          }
        });
        */
      } catch (error) {
        console.error('❌ Error saving vendor data:', error);
        reject(error);
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
   * Download all vendor data as JSON file
   */
  downloadAllVendorsAsJson(): void {
    const vendors = this.getAllVendors();
    const jsonStr = JSON.stringify(vendors, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `all-vendors-${timestamp}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download single vendor data as JSON file
   */
  downloadVendorAsJson(vendorData: VendorData): void {
    const jsonStr = JSON.stringify(vendorData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `vendor-${vendorData.email.split('@')[0]}-${timestamp}.json`;
    
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ JSON file downloaded: ${filename}`);
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
