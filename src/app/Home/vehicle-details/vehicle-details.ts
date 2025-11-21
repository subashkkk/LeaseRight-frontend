import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleFlowService, VehicleDetailsForm } from '../../services/vehicle-flow.service';

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
    make: null,
    model: null,
    fuelType: null,
    registrationDate: null
  };

  errorMessage = '';

  constructor(
    private flow: VehicleFlowService,
    private router: Router
  ) {
    const existing = this.flow.getDetails();
    if (existing) {
      this.details = { ...existing };
      // Convert nulls to empty strings for easier editing
      this.details.make = existing.make || '';
      this.details.model = existing.model || '';
      this.details.fuelType = existing.fuelType || '';
      this.details.registrationDate = existing.registrationDate || '';
    }
  }

  next(): void {
    this.errorMessage = '';

    if (!this.details.registrationNumber || !this.details.ownerName) {
      this.errorMessage = 'Registration number and owner name are required.';
      return;
    }

    // Any field that was blank stays as empty string; that is acceptable
    this.flow.setDetails(this.details);
    this.router.navigate(['/home/vendor-dashboard']);
  }

  cancel(): void {
    this.flow.clear();
    this.router.navigate(['/home/vendor-dashboard']);
  }
}
