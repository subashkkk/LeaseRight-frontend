import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { API_CONFIG, getApiUrl } from '../config/api.config';

export interface CompanyData {
  name: string;
  mail: string;
  password: string;
  role: string;
  // Optional metadata fields for future use
  contactNo?: string;
  gstNo?: string;
  registeredAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyDataService {
  // Toggle between backend API and LocalStorage
  private USE_BACKEND_API = true; // Set to true to use your backend
  
  private readonly STORAGE_KEY = 'company_registrations';

  private baseUrl = 'http://localhost:8080/api'; // adjust if needed


  constructor(
    private http: HttpClient
  ) {}

  /**
   * Save company data
   * Uses backend API if USE_BACKEND_API is true, otherwise uses LocalStorage
   */
  saveCompanyData(companyData: CompanyData): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        // Backend API implementation
        const url = getApiUrl(API_CONFIG.COMPANY.REGISTER);
        console.log(' Saving company via backend API:', url);
        
        this.http.post(url, companyData).subscribe({
          next: (response: any) => {
            console.log(' Company saved to backend:', response);
            resolve(response);
          },
          error: (error) => {
            console.error(' Backend company save failed:', error);
            reject(error);
          }
        });
      } else {
        // LocalStorage fallback
        try {
          const existingData = this.getAllCompanies();
          existingData.push(companyData);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
          
          console.log(' Company data saved to LocalStorage');
          console.log(' Total companies:', existingData.length);
          
          resolve({
            success: true,
            message: 'Company registration successful',
            data: companyData
          });
        } catch (error) {
          console.error(' Error saving company data:', error);
          reject(error);
        }
      }
    });
  }

  /**
   * Get all companies
   * Currently: Retrieves from LocalStorage
   * Future: Will send GET request to backend API
   */
  getAllCompanies(): CompanyData[] {
    // === CURRENT IMPLEMENTATION (LocalStorage) ===
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error retrieving companies:', error);
      return [];
    }

    // === FUTURE IMPLEMENTATION (Backend API) ===
    // When backend is ready, replace above code with:
    /*
    return this.http.get<CompanyData[]>(this.API_URL);
    */
  }

  /**
   * Get company by email
   * Currently: Searches LocalStorage
   * Future: Will send GET request to backend API
   */
  getCompanyByEmail(email: string): CompanyData | null {
    // === CURRENT IMPLEMENTATION (LocalStorage) ===
    const companies = this.getAllCompanies();
    return companies.find(c => c.mail === email) || null;

    // === FUTURE IMPLEMENTATION (Backend API) ===
    // When backend is ready, replace above code with:
    /*
    return this.http.get<CompanyData>(`${this.API_URL}/${email}`);
    */
  }

  /**
   * Check if email already exists
   */
  isEmailRegistered(email: string): boolean {
    const company = this.getCompanyByEmail(email);
    return company !== null;
  }

  /**
   * Get all companies as JSON string (for export/backup purposes)
   */
  exportCompaniesAsJson(): string {
    const companies = this.getAllCompanies();
    return JSON.stringify(companies, null, 2);
  }

  /**
   * Import companies from JSON string (for restore/import purposes)
   */
  importCompaniesFromJson(jsonString: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const companies = JSON.parse(jsonString);
        if (Array.isArray(companies)) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(companies));
          console.log('✅ Companies imported successfully');
          resolve({ success: true, count: companies.length });
        } else {
          reject({ error: 'Invalid JSON format' });
        }
      } catch (error) {
        console.error('❌ Error importing companies:', error);
        reject(error);
      }
    });
  }

  /**
   * Clear all company data (for testing purposes)
   */
  clearAllCompanies(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All company data cleared from LocalStorage');
  }

  /**
   * Get total number of registered companies
   */
  getTotalCompanies(): number {
    return this.getAllCompanies().length;
  }

getCompanyQuotations(companyId: string): Observable<any> {
  const url = `${this.baseUrl}/company/${companyId}/quotations`;
  return this.http.get(url);
}

updateQuotationStatus(quotationId: string, status: string): Observable<any> {
  const url = `${this.baseUrl}/quotations/${quotationId}/status`;
  return this.http.put(url, { status });
}





}
