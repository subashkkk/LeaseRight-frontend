import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { API_CONFIG, getApiUrl } from '../config/api.config';

// Vehicle types from backend enum
export type VehicleType = 'SUV' | 'SEDAN' | 'HATCHBACK' | 'CUV' | 'MUV' | 'PICKUP' | 'SPORTS' | 'LUXURY';

// Lease Request interface matching backend LeaseRequestDTO
export interface LeaseRequest {
  id?: number;  // Backend uses Long
  vehicleType: VehicleType;
  preferredModel?: string;
  leaseDuration: number;  // Integer in months/years
  minBudget: number;
  maxBudget: number;
  additionalRequirements?: string;
  companyId?: number;
  // Additional frontend-only fields for display
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
  vendorResponse?: string;
  companyName?: string;
  companyEmail?: string;
}

export interface Vehicle {
  id: string;
  vendorEmail: string;
  vendorCompany: string;
  make: string;
  model: string;
  year: number;
  type: string;
  pricePerMonth: number;
  available: boolean;
  imageUrl: string;
  features: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LeaseRequestService {
  // Toggle between backend API and LocalStorage
  // Set to false for now to use localStorage (backend integration ready when you start backend)
  private USE_BACKEND_API = true; // Set to true to use your backend
  
  private readonly REQUESTS_KEY = 'lease_requests';
  private readonly VEHICLES_KEY = 'available_vehicles';

  constructor(
    private http: HttpClient
  ) {
    // No dummy data initialization - always use backend
  }

  /**
   * Initialize dummy data for demonstration (DEPRECATED - Not used anymore)
   */
  private initializeDummyData(): void {
    // Add dummy vehicles if none exist
    const vehicles = this.getAllVehicles();
    if (vehicles.length === 0) {
      const dummyVehicles: Vehicle[] = [
        {
          id: 'v1',
          vendorEmail: 'vendor1@leasing.com',
          vendorCompany: 'Premium Auto Leasing',
          make: 'Toyota',
          model: 'Camry',
          year: 2024,
          type: 'Sedan',
          pricePerMonth: 450,
          available: true,
          imageUrl: 'assets/vehicles/camry.jpg',
          features: ['Automatic', 'GPS', 'Bluetooth', 'Backup Camera']
        },
        {
          id: 'v2',
          vendorEmail: 'vendor1@leasing.com',
          vendorCompany: 'Premium Auto Leasing',
          make: 'Honda',
          model: 'CR-V',
          year: 2024,
          type: 'SUV',
          pricePerMonth: 550,
          available: true,
          imageUrl: 'assets/vehicles/crv.jpg',
          features: ['AWD', 'Leather Seats', 'Sunroof', 'Apple CarPlay']
        },
        {
          id: 'v3',
          vendorEmail: 'vendor2@leasing.com',
          vendorCompany: 'Elite Fleet Solutions',
          make: 'Ford',
          model: 'F-150',
          year: 2023,
          type: 'Truck',
          pricePerMonth: 650,
          available: true,
          imageUrl: 'assets/vehicles/f150.jpg',
          features: ['4WD', 'Towing Package', 'Crew Cab', 'Navigation']
        },
        {
          id: 'v4',
          vendorEmail: 'vendor2@leasing.com',
          vendorCompany: 'Elite Fleet Solutions',
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          type: 'Electric',
          pricePerMonth: 750,
          available: true,
          imageUrl: 'assets/vehicles/model3.jpg',
          features: ['Autopilot', 'Premium Audio', 'Full Electric', 'Fast Charging']
        },
        {
          id: 'v5',
          vendorEmail: 'vendor1@leasing.com',
          vendorCompany: 'Premium Auto Leasing',
          make: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          type: 'Luxury',
          pricePerMonth: 900,
          available: true,
          imageUrl: 'assets/vehicles/eclass.jpg',
          features: ['Luxury Interior', 'Premium Sound', 'Massage Seats', 'Advanced Safety']
        }
      ];
      localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(dummyVehicles));
    }
  }

  // ========== LEASE REQUEST METHODS ==========

  /**
   * Create a new lease request
   * Uses backend API if USE_BACKEND_API is true, otherwise uses LocalStorage
   */
  createLeaseRequest(requestData: Omit<LeaseRequest, 'id' | 'status' | 'createdAt'>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        // Backend API implementation
        const url = getApiUrl(API_CONFIG.LEASE_REQUEST.CREATE);
        console.log('📝 Creating lease request via backend API:', url);
        console.log('📦 Request data:', requestData);
        
        // Prepare data matching backend LeaseRequestDTO
        const backendData = {
          vehicleType: requestData.vehicleType,
          preferredModel: requestData.preferredModel || '',
          leaseDuration: requestData.leaseDuration,
          minBudget: requestData.minBudget,
          maxBudget: requestData.maxBudget,
          additionalRequirements: requestData.additionalRequirements || '',
          companyId: requestData.companyId
        };
        
        this.http.post(url, backendData, { responseType: 'text' }).subscribe({
          next: (response: any) => {
            console.log('✅ Lease request created via backend:', response);
            resolve({ success: true, message: response, data: backendData });
          },
          error: (error) => {
            console.error('❌ Backend lease request creation failed:', error);
            reject(error);
          }
        });
      } else {
        // LocalStorage fallback
        try {
          const newRequest: any = {
            ...requestData,
            id: Math.floor(Math.random() * 10000),
            status: 'pending',
            createdAt: new Date().toISOString()
          };

          const requests = this.getAllLeaseRequestsLocal();
          requests.push(newRequest);
          localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));

          console.log('✅ Lease request created (LocalStorage):', newRequest);
          resolve({ success: true, message: 'Lease request submitted successfully', data: newRequest });
        } catch (error) {
          console.error('❌ Error creating lease request:', error);
          reject(error);
        }
      }
    });
  }

  /**
   * Get all lease requests from LocalStorage (for local testing)
   */
  private getAllLeaseRequestsLocal(): any[] {
    try {
      const data = localStorage.getItem(this.REQUESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error retrieving lease requests:', error);
      return [];
    }
  }

  /**
   * Get all lease requests from backend
   */
  getAllLeaseRequests(): Promise<LeaseRequest[]> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        const url = getApiUrl(API_CONFIG.LEASE_REQUEST.GET_ALL);
        console.log('📥 Fetching all lease requests from backend:', url);
        
        this.http.get<LeaseRequest[]>(url).subscribe({
          next: (requests) => {
            console.log('✅ Fetched requests:', requests);
            resolve(requests);
          },
          error: (error) => {
            console.error('❌ Failed to fetch requests:', error);
            reject(error);
          }
        });
      } else {
        resolve(this.getAllLeaseRequestsLocal());
      }
    });
  }

  /**
   * Get requests by company ID from backend
   */
  getRequestsByCompany(companyId: number): Promise<LeaseRequest[]> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        const url = getApiUrl(API_CONFIG.LEASE_REQUEST.GET_BY_COMPANY.replace(':companyId', companyId.toString()));
        console.log('📥 Fetching company requests from backend:', url);
        
        this.http.get<LeaseRequest[]>(url).subscribe({
          next: (requests) => {
            console.log('✅ Fetched company requests:', requests);
            resolve(requests);
          },
          error: (error) => {
            console.error('❌ Failed to fetch company requests:', error);
            reject(error);
          }
        });
      } else {
        const localRequests = this.getAllLeaseRequestsLocal();
        resolve(localRequests);
      }
    });
  }

  /**
   * Get pending requests for vendors (all requests from backend)
   */
  getPendingRequests(): Promise<LeaseRequest[]> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        // Fetch all requests and filter pending on frontend
        this.getAllLeaseRequests()
          .then(requests => {
            const pending = requests.filter(req => !req.status || req.status === 'pending');
            resolve(pending);
          })
          .catch(error => reject(error));
      } else {
        const pending = this.getAllLeaseRequestsLocal().filter((req: any) => req.status === 'pending');
        resolve(pending);
      }
    });
  }

  /**
   * Update request status
   * Uses LocalStorage for now (backend endpoint for status update not yet implemented)
   */
  updateRequestStatus(requestId: string, status: 'approved' | 'rejected', vendorResponse?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // LocalStorage implementation (backend status update API not available yet)
      try {
        const requests = this.getAllLeaseRequestsLocal();
        const index = requests.findIndex((req: any) => String(req.id) === String(requestId));

        if (index === -1) {
          reject({ error: 'Request not found' });
          return;
        }

        requests[index].status = status;
        if (vendorResponse) {
          requests[index].vendorResponse = vendorResponse;
        }

        localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
        console.log(`✅ Request ${requestId} status updated to ${status} (LocalStorage)`);
        resolve({ success: true, message: 'Request status updated' });
      } catch (error) {
        console.error('❌ Error updating request status:', error);
        reject(error);
      }
    });
  }

  /**
   * Get request statistics for company
   */
  async getCompanyStats(companyId: number): Promise<any> {
    try {
      const requests = await this.getRequestsByCompany(companyId);
      return {
        total: requests.length,
        pending: requests.filter((r: LeaseRequest) => !r.status || r.status === 'pending').length,
        approved: requests.filter((r: LeaseRequest) => r.status === 'approved').length,
        rejected: requests.filter((r: LeaseRequest) => r.status === 'rejected').length
      };
    } catch (error) {
      console.error('❌ Error getting company stats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  // ========== VEHICLE METHODS ==========

  /**
   * Get all available vehicles
   */
  getAllVehicles(): Vehicle[] {
    try {
      const data = localStorage.getItem(this.VEHICLES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error retrieving vehicles:', error);
      return [];
    }
  }

  /**
   * Get vehicles by vendor email
   */
  getVehiclesByVendor(vendorEmail: string): Vehicle[] {
    return this.getAllVehicles().filter(v => v.vendorEmail === vendorEmail);
  }

  /**
   * Get available vehicles (not leased)
   */
  getAvailableVehicles(): Vehicle[] {
    return this.getAllVehicles().filter(v => v.available);
  }

  /**
   * Add a new vehicle
   */
  addVehicle(vehicleData: Omit<Vehicle, 'id'>): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const newVehicle: Vehicle = {
          ...vehicleData,
          id: this.generateId()
        };

        const vehicles = this.getAllVehicles();
        vehicles.push(newVehicle);
        localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(vehicles));

        console.log('✅ Vehicle added:', newVehicle);
        resolve({ success: true, message: 'Vehicle added successfully', data: newVehicle });
      } catch (error) {
        console.error('❌ Error adding vehicle:', error);
        reject(error);
      }
    });
  }

  /**
   * Get vendor statistics
   */
  async getVendorStats(vendorEmail: string): Promise<any> {
    try {
      const vehicles = this.getVehiclesByVendor(vendorEmail);
      const allRequests = await this.getAllLeaseRequests();
      
      return {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter((v: Vehicle) => v.available).length,
        leasedVehicles: vehicles.filter((v: Vehicle) => !v.available).length,
        pendingRequests: allRequests.filter((r: LeaseRequest) => !r.status || r.status === 'pending').length,
        approvedRequests: allRequests.filter((r: LeaseRequest) => r.status === 'approved').length,
        totalRevenue: vehicles.filter((v: Vehicle) => !v.available).reduce((sum: number, v: Vehicle) => sum + v.pricePerMonth, 0)
      };
    } catch (error) {
      console.error('❌ Error getting vendor stats:', error);
      return {
        totalVehicles: 0,
        availableVehicles: 0,
        leasedVehicles: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalRevenue: 0
      };
    }
  }

  // ========== UTILITY METHODS ==========

  private generateId(): string {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Clear all lease requests (for testing)
   */
  clearAllRequests(): void {
    localStorage.removeItem(this.REQUESTS_KEY);
    console.log('🗑️ All lease requests cleared');
  }

  /**
   * Clear all vehicles (for testing)
   */
  clearAllVehicles(): void {
    localStorage.removeItem(this.VEHICLES_KEY);
    console.log('🗑️ All vehicles cleared');
  }
}
