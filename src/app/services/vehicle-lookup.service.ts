import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VehicleLookupResult {
  registrationNumber: string;
  ownerName: string;
  make: string | null;
  model: string | null;
  fuelType: string | null;
  registrationDate: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleLookupService {
  // Toggle between backend/third-party API and mock data
  private USE_BACKEND_API = false; // placeholder for future real API integration

  constructor(private http: HttpClient) {}

  lookupByRegistration(regNo: string, ownerName: string): Promise<VehicleLookupResult> {
    // For now always return mocked data to avoid build errors until backend endpoint is ready
    return Promise.resolve({
      registrationNumber: regNo,
      ownerName,
      make: 'Toyota',
      model: 'Innova',
      fuelType: 'Diesel',
      registrationDate: '2022-01-15'
    });
  }
}
