import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { API_CONFIG, getApiUrl } from '../config/api.config';

export interface LeaseRequest {
  id: string;
  companyEmail: string;
  companyName: string;
  contactPerson: string;
  vehicleType: string;
  quantity: number;
  leaseDuration: number; // in months
  startDate: string;
  budget: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  vendorResponse?: string;
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
  private USE_BACKEND_API = false; // Set to true to use your backend
  
  private readonly REQUESTS_KEY = 'lease_requests';
  private readonly VEHICLES_KEY = 'available_vehicles';

  constructor(
    private http: HttpClient
  ) {
    // Initialize dummy data only if using LocalStorage
    if (!this.USE_BACKEND_API) {
      this.initializeDummyData();
    }
  }

  /**
   * Initialize dummy data for demonstration
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
        
        this.http.post(url, requestData).subscribe({
          next: (response: any) => {
            console.log('✅ Lease request created via backend:', response);
            resolve(response);
          },
          error: (error) => {
            console.error('❌ Backend lease request creation failed:', error);
            reject(error);
          }
        });
      } else {
        // LocalStorage fallback
        try {
          const newRequest: LeaseRequest = {
            ...requestData,
            id: this.generateId(),
            status: 'pending',
            createdAt: new Date().toISOString()
          };

          const requests = this.getAllLeaseRequests();
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
   * Get all lease requests
   */
  getAllLeaseRequests(): LeaseRequest[] {
    try {
      const data = localStorage.getItem(this.REQUESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error retrieving lease requests:', error);
      return [];
    }
  }

  /**
   * Get requests by company email
   */
  getRequestsByCompany(companyEmail: string): LeaseRequest[] {
    return this.getAllLeaseRequests().filter(req => req.companyEmail === companyEmail);
  }

  /**
   * Get all pending requests (for vendors)
   */
  getPendingRequests(): LeaseRequest[] {
    return this.getAllLeaseRequests().filter(req => req.status === 'pending');
  }

  /**
   * Update request status
   * Uses backend API if USE_BACKEND_API is true, otherwise uses LocalStorage
   */
  updateRequestStatus(requestId: string, status: 'approved' | 'rejected', vendorResponse?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.USE_BACKEND_API) {
        // Backend API implementation
        const endpoint = status === 'approved' 
          ? API_CONFIG.LEASE_REQUEST.APPROVE.replace(':id', requestId)
          : API_CONFIG.LEASE_REQUEST.REJECT.replace(':id', requestId);
        const url = getApiUrl(endpoint);
        console.log(`📝 Updating request status via backend API (${status}):`, url);
        
        const body = vendorResponse ? { vendorResponse } : {};
        
        this.http.post(url, body).subscribe({
          next: (response: any) => {
            console.log(`✅ Request ${requestId} ${status} via backend:`, response);
            resolve(response);
          },
          error: (error) => {
            console.error(`❌ Backend request status update failed:`, error);
            reject(error);
          }
        });
      } else {
        // LocalStorage fallback
        try {
          const requests = this.getAllLeaseRequests();
          const index = requests.findIndex(req => req.id === requestId);

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
      }
    });
  }

  /**
   * Get request statistics for company
   */
  getCompanyStats(companyEmail: string): any {
    const requests = this.getRequestsByCompany(companyEmail);
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
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
  getVendorStats(vendorEmail: string): any {
    const vehicles = this.getVehiclesByVendor(vendorEmail);
    const allRequests = this.getAllLeaseRequests();
    
    return {
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(v => v.available).length,
      leasedVehicles: vehicles.filter(v => !v.available).length,
      pendingRequests: allRequests.filter(r => r.status === 'pending').length,
      approvedRequests: allRequests.filter(r => r.status === 'approved').length,
      totalRevenue: vehicles.filter(v => !v.available).reduce((sum, v) => sum + v.pricePerMonth, 0)
    };
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
