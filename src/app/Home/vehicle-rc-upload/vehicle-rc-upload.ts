import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VehicleFlowService } from '../../services/vehicle-flow.service';

@Component({
  selector: 'app-vehicle-rc-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-rc-upload.html',
  styleUrls: ['./vehicle-rc-upload.css']
})
export class VehicleRcUploadComponent {
  rcFrontFileName = '';
  rcBackFileName = '';
  errorMessage = '';

  constructor(
    private flow: VehicleFlowService,
    private router: Router
  ) {}

  get details() {
    return this.flow.getDetails();
  }

  onRcFrontSelected(event: any): void {
    const file = event?.target?.files?.[0];
    this.rcFrontFileName = file ? file.name : '';
  }

  onRcBackSelected(event: any): void {
    const file = event?.target?.files?.[0];
    this.rcBackFileName = file ? file.name : '';
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.rcFrontFileName || !this.rcBackFileName) {
      this.errorMessage = 'Please upload both front and back of the RC book.';
      return;
    }

    console.log('Final vehicle submission:', {
      details: this.details,
      rcFrontFileName: this.rcFrontFileName,
      rcBackFileName: this.rcBackFileName,
    });

    this.flow.clear();
    this.router.navigate(['/home/vendor-dashboard']);
  }

  cancel(): void {
    this.flow.clear();
    this.router.navigate(['/home/vendor-dashboard']);
  }
}
