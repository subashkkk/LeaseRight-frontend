import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, firstValueFrom } from 'rxjs';
import { API_CONFIG, getApiUrl, replaceUrlParams } from '../config/api.config';

// Vehicle types from backend enum
export type VehicleType = 'SUV' | 'SEDAN' | 'HATCHBACK' | 'CUV' | 'MUV' | 'PICKUP' | 'SPORTS' | 'LUXURY';

// Company object from backend UserEntity
export interface CompanyInfo {
  id?: number;
  name?: string;
  mail?: string;
  gstNo?: string;
  panNo?: string;
  contactNo?: string;
  role?: string;
  isVerified?: boolean;
}

// Lease Request interface matching backend LeaseRequestDTO
export interface LeaseRequest {
  id?: number;  // Backend uses Long
  vehicleType: VehicleType;
  preferredModel?: string;
  leaseDuration: number | string;  // Can be number or formatted string like "2 years"
  minBudget: number;
  maxBudget: number;
  additionalRequirements?: string;
  companyId?: number;
  // Company object from backend (UserEntity)
  company?: CompanyInfo;
  // Additional frontend-only fields for display
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
  vendorResponse?: string;
  // Legacy fields (kept for backward compatibility)
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

// Shape of vehicle objects returned by backend VehicleVerificationEntity
export interface BackendVehicle {
  id?: number;
  brandName?: string | null;
  brandModel?: string | null;
  fuelType?: string | null;
  insuranceExpiry?: string | null;
  seatingCapacity?: number | null;
  licensePlate?: string | null;
  ownerName?: string | null;
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
   * Fetch vehicles for a specific vendor (by email) from backend
   */
  getVendorVehiclesFromBackend(vendorEmail: string): Promise<BackendVehicle[]> {
    const url = getApiUrl('/vehicle/vendor');
    console.log('🌐 API Call:', url, 'with params:', { mail: vendorEmail });
    return new Promise((resolve, reject) => {
      this.http
        .get<BackendVehicle[]>(url, { params: { mail: vendorEmail } })
        .pipe(
          catchError((error) => {
            console.error('❌ Failed to fetch vendor vehicles from backend:', error);
            console.error('Error details:', error.error);
            throw error;
          })
        )
        .subscribe({
          next: (vehicles) => {
            console.log('📦 Backend response - vehicles:', vehicles);
            resolve(vehicles);
          },
          error: (error) => reject(error)
        });
    });
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
   * Update an existing lease request
   */
  updateLeaseRequest(requestId: number, requestData: Omit<LeaseRequest, 'status' | 'createdAt'>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        // Backend API - Use the correct UPDATE endpoint
        const url = getApiUrl(replaceUrlParams(API_CONFIG.LEASE_REQUEST.UPDATE, { id: requestId }));
        console.log('📝 Updating lease request via backend:', url);
        
        // Parse leaseDuration - extract number if it's a string like "15 years"
        let duration: any = requestData.leaseDuration;
        if (typeof duration === 'string') {
          const match = duration.match(/(\d+)/);
          duration = match ? parseInt(match[1], 10) : duration;
        }
        
        const backendData = {
          vehicleType: requestData.vehicleType,
          preferredModel: requestData.preferredModel || '',
          leaseDuration: duration,
          minBudget: requestData.minBudget,
          maxBudget: requestData.maxBudget,
          additionalRequirements: requestData.additionalRequirements || '',
          companyId: requestData.companyId
        };
        
        this.http.put(url, backendData).subscribe({
          next: (response) => {
            console.log('✅ Lease request updated:', response);
            resolve(response);
          },
          error: (error) => {
            console.error('❌ Error updating lease request:', error);
            reject(error);
          }
        });
      } else {
        // LocalStorage fallback
        try {
          const requests = this.getAllLeaseRequestsLocal();
          const index = requests.findIndex(r => r.id === requestId);
          
          if (index === -1) {
            reject(new Error('Request not found'));
            return;
          }
          
          requests[index] = {
            ...requests[index],
            ...requestData,
            id: requestId
          };
          
          localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(requests));
          console.log('✅ Lease request updated (LocalStorage)');
          resolve({ success: true, message: 'Request updated successfully' });
        } catch (error) {
          console.error('❌ Error updating request:', error);
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
   * Get pending requests for a specific vendor (excludes requests already quoted by this vendor)
   */
  async getPendingRequestsForVendor(vendorId: number): Promise<LeaseRequest[]> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.LEASE_REQUEST.VENDOR_PENDING, { vendorId }));
    console.log('📋 Fetching pending requests for vendor:', url);
    return firstValueFrom(this.http.get<LeaseRequest[]>(url));
  }

  /**
   * Get pending requests count for a specific vendor
   */
  async getPendingCountForVendor(vendorId: number): Promise<number> {
    const url = getApiUrl(replaceUrlParams(API_CONFIG.LEASE_REQUEST.VENDOR_PENDING_COUNT, { vendorId }));
    return firstValueFrom(this.http.get<number>(url));
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
      let totalVehicles = 0;
      let leasedVehicles = 0;
      let availableVehicles = 0;
      let totalRevenue = 0;

      if (this.USE_BACKEND_API) {
        // When backend is enabled, use real vehicles from /vehicle/vendor
        const backendVehicles: BackendVehicle[] = await this.getVendorVehiclesFromBackend(vendorEmail);

        // Map minimal stats. If backend later adds availability/price fields, they can be used here.
        totalVehicles = backendVehicles.length;
        // For now, treat all vehicles as available with zero revenue until lease linkage is implemented.
        availableVehicles = backendVehicles.length;
        leasedVehicles = 0;
        totalRevenue = 0;
      } else {
        const vehicles = this.getVehiclesByVendor(vendorEmail);
        totalVehicles = vehicles.length;
        availableVehicles = vehicles.filter((v: Vehicle) => v.available).length;
        leasedVehicles = vehicles.filter((v: Vehicle) => !v.available).length;
        totalRevenue = vehicles
          .filter((v: Vehicle) => !v.available)
          .reduce((sum: number, v: Vehicle) => sum + v.pricePerMonth, 0);
      }

      const allRequests = await this.getAllLeaseRequests();
      
      return {
        totalVehicles,
        availableVehicles,
        leasedVehicles,
        pendingRequests: allRequests.filter((r: LeaseRequest) => !r.status || r.status === 'pending').length,
        approvedRequests: allRequests.filter((r: LeaseRequest) => r.status === 'approved').length,
        totalRevenue
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
