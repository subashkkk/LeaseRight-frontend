import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyDataService } from '../../services/company-data.service';
import { OtpService } from '../../services/otp.service';

@Component({
  selector: 'app-signup-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-company.html',
  styleUrl: './signup-company.css',
})
export class SignupCompany implements OnInit {
  companySignupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private companyDataService: CompanyDataService,
    private otpService: OtpService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.companySignupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      contactNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      mail: ['', [Validators.required, Validators.email]],
      gstNo: ['', [Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
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
  get name() { return this.companySignupForm.get('name'); }
  get contactNo() { return this.companySignupForm.get('contactNo'); }
  get mail() { return this.companySignupForm.get('mail'); }
  get gstNo() { return this.companySignupForm.get('gstNo'); }
  get password() { return this.companySignupForm.get('password'); }
  get confirmPassword() { return this.companySignupForm.get('confirmPassword'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.companySignupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const mail = this.companySignupForm.value.mail;

      // Create company data object matching backend UserEntity
      const companyData = {
        name: this.companySignupForm.value.name,
        mail: this.companySignupForm.value.mail,
        contactNo: this.companySignupForm.value.contactNo,
        gstNo: this.companySignupForm.value.gstNo,
        password: this.companySignupForm.value.password,
        role: 'company'
      };

      // Call backend signup endpoint (validates GST and sends OTP)
      this.otpService.startOtpFlow({
        role: 'company',
        email: mail,
        payload: companyData
      }).then(() => {
        this.isLoading = false;
        this.companySignupForm.disable();
        this.router.navigate(['/auth/verify-otp'], { queryParams: { email: mail, role: 'company' } });
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
      this.markFormGroupTouched(this.companySignupForm);
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

  navigateToVendorSignup(): void {
    this.router.navigate(['/auth/signup-vendor']);
  }
}
