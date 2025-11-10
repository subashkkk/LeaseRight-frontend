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
