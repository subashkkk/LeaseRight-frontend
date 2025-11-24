import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleFlowService, VehicleDetailsForm } from '../../services/vehicle-flow.service';
import { VehicleLookupService } from '../../services/vehicle-lookup.service';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-details.html',
  styleUrls: ['./vehicle-details.css']
})
export class VehicleDetailsComponent {
  details: VehicleDetailsForm = {
    registrationNumber: '',
    ownerName: '',
    make: '',
    model: '',
    fuelType: '',
    registrationDate: '',

    brandName: '',
    brandModel: '',
    isFinanced: '',
    manufacturingDate: '',
    blacklistStatus: '',
    financer: '',
    bodyType: '',
    color: '',
    rcStatus: '',
    fitUpto: '',
    taxUpto: '',
    category: '',
    insuranceCompany: '',
    insurancePolicy: '',
    insuranceExpiry: '',
    chasisNumber: '',
    ownerCount: '',
    seatingCapacity: '',
    licensePlate: ''
  };

  errorMessage = '';

  constructor(
    private flow: VehicleFlowService,
    private router: Router,
    private vehicleLookup: VehicleLookupService
  ) {
    const existing = this.flow.getDetails();
    if (existing) {
      this.details = {
        registrationNumber: existing.registrationNumber || '',
        ownerName: existing.ownerName || '',
        make: existing.make || '',
        model: existing.model || '',
        fuelType: existing.fuelType || '',
        registrationDate: existing.registrationDate || '',

        brandName: existing.brandName || '',
        brandModel: existing.brandModel || '',
        isFinanced: existing.isFinanced || '',
        manufacturingDate: existing.manufacturingDate || '',
        blacklistStatus: existing.blacklistStatus || '',
        financer: existing.financer || '',
        bodyType: existing.bodyType || '',
        color: existing.color || '',
        rcStatus: existing.rcStatus || '',
        fitUpto: existing.fitUpto || '',
        taxUpto: existing.taxUpto || '',
        category: existing.category || '',
        insuranceCompany: existing.insuranceCompany || '',
        insurancePolicy: existing.insurancePolicy || '',
        insuranceExpiry: existing.insuranceExpiry || '',
        chasisNumber: existing.chasisNumber || '',
        ownerCount: existing.ownerCount || '',
        seatingCapacity: existing.seatingCapacity || '',
        licensePlate: existing.licensePlate || ''
      };
    }
  }

  next(): void {
    this.errorMessage = '';

    if (!this.details.registrationNumber || !this.details.ownerName) {
      this.errorMessage = 'Registration number and owner name are required.';
      return;
    }

    this.vehicleLookup
      .saveVehicle(this.details)
      .then(() => {
        // Keep details in flow and redirect to dashboard with success flag
        this.flow.setDetails(this.details);
        this.router.navigate(['/home/vendor-dashboard'], {
          queryParams: { vehicleSaved: '1' }
        });
      })
      .catch(error => {
        console.error('Failed to save vehicle:', error);
        this.errorMessage = 'Failed to save vehicle. Please try again.';
      });
  }

  cancel(): void {
    this.flow.clear();
    this.router.navigate(['/home/vendor-dashboard']);
  }
}
