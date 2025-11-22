import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface VehicleLookupResult {
  registrationNumber: string;
  ownerName: string;
  make: string | null;
  model: string | null;
  fuelType: string | null;
  registrationDate: string | null;

  // Extended details (mostly string-based for now so they map easily from APIs)
  brandName?: string | null;
  brandModel?: string | null;
  isFinanced?: string | null;
  manufacturingDate?: string | null;
  blacklistStatus?: string | null;
  financer?: string | null;
  bodyType?: string | null;
  color?: string | null;
  rcStatus?: string | null;
  fitUpto?: string | null;
  taxUpto?: string | null;
  category?: string | null;
  insuranceCompany?: string | null;
  insurancePolicy?: string | null;
  insuranceExpiry?: string | null;
  chasisNumber?: string | null;
  ownerCount?: string | null;
  seatingCapacity?: string | null;
  licensePlate?: string | null;
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
      registrationDate: '2022-01-15',

      // Mock values for extended fields
      brandName: 'Toyota',
      brandModel: 'Innova Crysta',
      isFinanced: 'Yes',
      manufacturingDate: '2021-11-10',
      blacklistStatus: 'Clear',
      financer: 'HDFC Bank',
      bodyType: 'SUV',
      color: 'White',
      rcStatus: 'Active',
      fitUpto: '2026-11-10',
      taxUpto: '2025-11-10',
      category: 'Commercial',
      insuranceCompany: 'ICICI Lombard',
      insurancePolicy: 'POL123456',
      insuranceExpiry: '2024-11-10',
      chasisNumber: 'CHASIS1234567890',
      ownerCount: '1',
      seatingCapacity: '7',
      licensePlate: regNo
    });
  }
}
