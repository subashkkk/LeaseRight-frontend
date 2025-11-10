import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http'; // Uncomment when backend is ready
// import { Observable } from 'rxjs'; // Uncomment when backend is ready

export interface CompanyData {
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
export class CompanyDataService {
  private readonly STORAGE_KEY = 'company_registrations';
  // private readonly API_URL = 'http://localhost:3000/api/companies'; // Your backend API URL

  constructor(
    // private http: HttpClient // Uncomment when backend is ready
  ) {}

  /**
   * Save company data
   * Currently: Saves to LocalStorage
   * Future: Will send POST request to backend API
   */
  saveCompanyData(companyData: CompanyData): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // === CURRENT IMPLEMENTATION (LocalStorage) ===
        const existingData = this.getAllCompanies();
        existingData.push(companyData);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
        
        console.log('✅ Company data saved to LocalStorage:', companyData);
        resolve({ success: true, message: 'Company registered successfully' });

        // === FUTURE IMPLEMENTATION (Backend API) ===
        // When backend is ready, replace above code with:
        /*
        this.http.post(this.API_URL, companyData).subscribe({
          next: (response) => {
            console.log('✅ Company data saved to backend:', response);
            resolve(response);
          },
          error: (error) => {
            console.error('❌ Error saving to backend:', error);
            reject(error);
          }
        });
        */
      } catch (error) {
        console.error('❌ Error saving company data:', error);
        reject(error);
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
    return companies.find(c => c.email === email) || null;

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
}
