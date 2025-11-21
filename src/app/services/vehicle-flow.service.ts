import { Injectable } from '@angular/core';
import { VehicleLookupResult } from './vehicle-lookup.service';

export interface VehicleDetailsForm extends VehicleLookupResult {}

@Injectable({ providedIn: 'root' })
export class VehicleFlowService {
  private details: VehicleDetailsForm | null = null;

  setDetails(details: VehicleDetailsForm): void {
    this.details = { ...details };
  }

  getDetails(): VehicleDetailsForm | null {
    return this.details ? { ...this.details } : null;
  }

  clear(): void {
    this.details = null;
  }
}
