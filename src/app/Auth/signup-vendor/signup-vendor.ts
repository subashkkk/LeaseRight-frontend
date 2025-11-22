import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { EyeTrackingService } from '../../services/eye-tracking.service';
import { VendorDataService } from '../../services/vendor-data.service';
import { OtpService } from '../../services/otp.service';

@Component({
  selector: 'app-signup-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-vendor.html',
  styleUrl: './signup-vendor.css',
})
export class SignupVendor implements OnInit {
  vendorSignupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private vendorDataService: VendorDataService,
    private otpService: OtpService,
    private eyeTrackingService: EyeTrackingService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.eyeTrackingService.initEyeTracking();
  }

  initializeForm(): void {
    this.vendorSignupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      mail: ['', [Validators.required, Validators.email]],
      gstNo: ['', [Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      panNo: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Getters for form controls
  get name() { return this.vendorSignupForm.get('name'); }
  get contactNo() { return this.vendorSignupForm.get('contactNo'); }
  get mail() { return this.vendorSignupForm.get('mail'); }
  get gstNo() { return this.vendorSignupForm.get('gstNo'); }
  get panNo() { return this.vendorSignupForm.get('panNo'); }
  get password() { return this.vendorSignupForm.get('password'); }
  get confirmPassword() { return this.vendorSignupForm.get('confirmPassword'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.vendorSignupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const mail = this.vendorSignupForm.value.mail;

      // Create vendor data object matching backend UserEntity
      const vendorData = {
        name: this.vendorSignupForm.value.name,
        contactNo: this.vendorSignupForm.value.contactNo,
        mail: this.vendorSignupForm.value.mail,
        gstNo: this.vendorSignupForm.value.gstNo,
        panNo: this.vendorSignupForm.value.panNo,
        password: this.vendorSignupForm.value.password,
        role: 'vendor'
      };

      // Call backend signup endpoint (validates GST/PAN and sends OTP)
      this.otpService.startOtpFlow({
        role: 'vendor',
        email: mail,
        payload: vendorData
      }).then(() => {
        this.isLoading = false;
        this.vendorSignupForm.disable();
        this.router.navigate(['/auth/verify-otp'], { queryParams: { email: mail, role: 'vendor' } });
      }).catch(error => {
        this.isLoading = false;
        console.error('Signup error:', error);
        
        // Extract meaningful error message
        if (error.error && typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please ensure backend is running on port 8080.';
        } else {
          this.errorMessage = 'Signup failed. Please check your details and try again.';
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.markFormGroupTouched(this.vendorSignupForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToCompanySignup(): void {
    this.router.navigate(['/auth/signup-company']);
  }
}
