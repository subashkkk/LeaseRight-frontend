import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../config/api.config';

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
  constructor(private http: HttpClient) {}

  lookupByRegistration(regNo: string, ownerName: string): Promise<VehicleLookupResult> {
    const url = getApiUrl('/vehicle/addVehicle');

    return new Promise((resolve, reject) => {
      this.http
        .get<any>(url, {
          params: {
            vehicleNumber: regNo,
            ownerName: ownerName
          }
        })
        .subscribe({
          next: (response: any) => {
            const result: VehicleLookupResult = {
              registrationNumber: response.licensePlate || regNo,
              ownerName: response.ownerName || ownerName,
              make: response.brandName || null,
              model: response.brandModel || null,
              fuelType: response.fuelType || null,
              registrationDate: response.registrationDate || null,

              brandName: response.brandName ?? null,
              brandModel: response.brandModel ?? null,
              isFinanced:
                typeof response.isFinanced === 'boolean'
                  ? (response.isFinanced ? 'Yes' : 'No')
                  : (response.isFinanced ?? null),
              manufacturingDate: response.manufacturingDate ?? null,
              blacklistStatus: response.blacklistStatus ?? null,
              financer: response.financer ?? null,
              bodyType: response.bodyType ?? null,
              color: response.color ?? null,
              rcStatus: response.rcStatus ?? null,
              fitUpto: response.fitUpTo ?? response.fitUpto ?? null,
              taxUpto: response.taxUpto ?? null,
              category: response.category ?? null,
              insuranceCompany: response.insuranceCompany ?? null,
              insurancePolicy: response.insurancePolicy ?? null,
              insuranceExpiry: response.insuranceExpiry ?? null,
              chasisNumber: response.chassisNumber ?? response.chasisNumber ?? null,
              ownerCount:
                response.ownerCount !== undefined && response.ownerCount !== null
                  ? String(response.ownerCount)
                  : null,
              seatingCapacity:
                response.seatingCapacity !== undefined && response.seatingCapacity !== null
                  ? String(response.seatingCapacity)
                  : null,
              licensePlate: response.licensePlate || regNo
            };

            resolve(result);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }

  saveVehicle(details: VehicleLookupResult): Promise<any> {
    const url = getApiUrl('/vehicle/saveVehicle');

    const payload: any = {
      brandName: details.brandName ?? null,
      brandModel: details.brandModel ?? null,
      bodyType: details.bodyType ?? null,
      color: details.color ?? null,
      seatingCapacity: details.seatingCapacity ? Number(details.seatingCapacity) : null,
      ownerCount: details.ownerCount ? Number(details.ownerCount) : null,
      licensePlate: details.licensePlate || details.registrationNumber,
      ownerName: details.ownerName,
      fuelType: details.fuelType ?? null,
      rcStatus: details.rcStatus ?? null,
      registrationDate: details.registrationDate ?? null,
      blacklistStatus: details.blacklistStatus ?? null,
      fitUpTo: details.fitUpto ?? null,
      taxUpto: details.taxUpto ?? null,
      insuranceExpiry: details.insuranceExpiry ?? null,
      chassisNumber: details.chasisNumber ?? null
    };

    return new Promise((resolve, reject) => {
      this.http
        .post(url, payload, { responseType: 'text' })
        .subscribe({
          next: (response) => {
            resolve(response);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }
}
