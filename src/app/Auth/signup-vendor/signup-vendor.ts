import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorDataService } from '../../services/vendor-data.service';

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
    private vendorDataService: VendorDataService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.vendorSignupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      companyName: ['', [Validators.required, Validators.minLength(3)]],
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
  get firstName() { return this.vendorSignupForm.get('firstName'); }
  get lastName() { return this.vendorSignupForm.get('lastName'); }
  get email() { return this.vendorSignupForm.get('email'); }
  get companyName() { return this.vendorSignupForm.get('companyName'); }
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

      const email = this.vendorSignupForm.value.email;

      // Check if email already exists
      if (this.vendorDataService.isEmailRegistered(email)) {
        this.isLoading = false;
        this.errorMessage = 'This email is already registered. Please use a different email.';
        return;
      }

      // Create vendor data object (exclude confirmPassword)
      const vendorData = {
        firstName: this.vendorSignupForm.value.firstName,
        lastName: this.vendorSignupForm.value.lastName,
        email: this.vendorSignupForm.value.email,
        companyName: this.vendorSignupForm.value.companyName,
        password: this.vendorSignupForm.value.password,
        role: 'vendor',
        registeredAt: new Date().toISOString()
      };

      // Save data using service
      this.vendorDataService.saveVendorData(vendorData)
        .then(response => {
          this.isLoading = false;
          this.successMessage = 'Vendor registration successful! Data saved to LocalStorage & downloaded.';
          
          // Download JSON file as backup
          this.vendorDataService.downloadVendorAsJson(vendorData);

          // Log success
          console.log('📊 Total vendors registered:', this.vendorDataService.getTotalVendors());

          // Reset form
          this.vendorSignupForm.reset();

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        })
        .catch(error => {
          this.isLoading = false;
          this.errorMessage = 'Registration failed. Please try again.';
          console.error('❌ Registration error:', error);
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
