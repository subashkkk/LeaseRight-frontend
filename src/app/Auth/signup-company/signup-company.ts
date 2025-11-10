import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyDataService } from '../../services/company-data.service';

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
    private companyDataService: CompanyDataService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.companySignupForm = this.fb.group({
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
  get firstName() { return this.companySignupForm.get('firstName'); }
  get lastName() { return this.companySignupForm.get('lastName'); }
  get email() { return this.companySignupForm.get('email'); }
  get companyName() { return this.companySignupForm.get('companyName'); }
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

      const email = this.companySignupForm.value.email;

      // Check if email already exists
      if (this.companyDataService.isEmailRegistered(email)) {
        this.isLoading = false;
        this.errorMessage = 'This email is already registered. Please use a different email.';
        return;
      }

      // Create company data object (exclude confirmPassword)
      const companyData = {
        firstName: this.companySignupForm.value.firstName,
        lastName: this.companySignupForm.value.lastName,
        email: this.companySignupForm.value.email,
        companyName: this.companySignupForm.value.companyName,
        password: this.companySignupForm.value.password,
        role: 'company',
        registeredAt: new Date().toISOString()
      };

      // Save data using service
      this.companyDataService.saveCompanyData(companyData)
        .then(response => {
          this.isLoading = false;
          this.successMessage = 'Company registration successful! Data saved to LocalStorage & downloaded.';
          
          // Download JSON file as backup
          this.companyDataService.downloadCompanyAsJson(companyData);

          // Log success
          console.log('📊 Total companies registered:', this.companyDataService.getTotalCompanies());

          // Reset form
          this.companySignupForm.reset();

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
