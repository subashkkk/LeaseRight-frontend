import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { slideInAnimation, fadeInAnimation } from '../auth.animations';
import { TestCredentialsService } from '../../services/test-credentials.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  animations: [slideInAnimation, fadeInAnimation]
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Forgot password flow
  forgotMode = false;
  forgotStep: 'email' | 'otp' | 'reset' | 'success' = 'email';
  forgotEmailForm!: FormGroup;
  forgotOtpForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  forgotSuccessMessage = '';
  forgotErrorMessage = '';
  forgotEmailForDisplay = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private testCredentials: TestCredentialsService
  ) {}

  ngOnInit(): void {
    console.log('🔍 Login component ngOnInit called');
    console.log('📍 Current URL:', this.router.url);
    
    // Initialize test credentials for local development
    this.testCredentials.initializeTestCredentials();
    
    // Check if user is already logged in
    const isAuth = this.authService.isAuthenticated();
    console.log('🔐 Is authenticated:', isAuth);
    
    if (isAuth) {
      const userRole = localStorage.getItem('userRole');
      console.log('👤 User role:', userRole);
      console.log('⚠️  User already authenticated, redirecting to dashboard...');
      
      if (userRole === 'vendor') {
        this.router.navigate(['/home/vendor-dashboard']);
      } else {
        this.router.navigate(['/home/company-dashboard']);
      }
      return;
    }

    console.log('✅ No authentication found, initializing login form');
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Forgot password forms
    this.forgotEmailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.forgotOtpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Load saved email if "Remember Me" was checked
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get forgotEmail() {
    return this.forgotEmailForm.get('email');
  }

  get forgotOtp() {
    return this.forgotOtpForm.get('otp');
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login successful! Redirecting...';
        
        // Save email if Remember Me is checked
        if (this.loginForm.get('rememberMe')?.value) {
          localStorage.setItem('savedEmail', credentials.email);
        } else {
          localStorage.removeItem('savedEmail');
        }

        // Store token and user data
        if (response.token) {
          this.authService.setToken(response.token);
          localStorage.setItem('authToken', response.token);
        }
        if (response.user) {
          this.authService.setUser(response.user);
        }
        if (response.userRole) {
          localStorage.setItem('userRole', response.userRole);
        }
        if (response.userName) {
          localStorage.setItem('userName', response.userName);
        }

        // Navigate based on user role
        setTimeout(() => {
          if (response.userRole === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (response.userRole === 'vendor') {
            this.router.navigate(['/home/vendor-dashboard']);
          } else {
            this.router.navigate(['/home/company-dashboard']);
          }
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup-frontpage']);
  }

  navigateToForgotPassword(): void {
    // Kept for backward compatibility if a separate route is added later
    this.startForgotPassword();
  }

  // ===== Forgot Password Flow (inline UI) =====

  startForgotPassword(): void {
    this.forgotMode = true;
    this.forgotStep = 'email';
    this.forgotSuccessMessage = '';
    this.forgotErrorMessage = '';
    // Pre-fill email if user already typed it in login form
    const currentEmail = this.loginForm.get('email')?.value;
    if (currentEmail) {
      this.forgotEmailForm.patchValue({ email: currentEmail });
    }
  }

  cancelForgotPassword(): void {
    this.forgotMode = false;
    this.forgotStep = 'email';
    this.forgotSuccessMessage = '';
    this.forgotErrorMessage = '';
  }

  submitForgotEmail(): void {
    if (this.forgotEmailForm.invalid) {
      this.forgotErrorMessage = 'Please enter a valid email address';
      return;
    }
    const email = this.forgotEmailForm.value.email;
    this.forgotEmailForDisplay = email;

    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = 'OTP has been sent to your email.';
    // In a real app, call backend API to send OTP here
    this.forgotStep = 'otp';
  }

  submitForgotOtp(): void {
    if (this.forgotOtpForm.invalid) {
      this.forgotErrorMessage = 'Please enter the OTP sent to your email';
      return;
    }
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = 'OTP verified. Please set your new password.';
    // In a real app, verify OTP with backend here
    this.forgotStep = 'reset';
  }

  resendOtp(): void {
    const email = this.forgotEmailForDisplay || this.forgotEmailForm.value.email;

    if (!email) {
      this.forgotErrorMessage = 'Email is missing. Please go back and enter your email again.';
      return;
    }

    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = 'OTP has been re-sent to your email.';
  }

  submitNewPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.forgotErrorMessage = 'Please enter a valid password in both fields';
      return;
    }

    const newPwd = this.resetPasswordForm.value.newPassword;
    const confirmPwd = this.resetPasswordForm.value.confirmPassword;

    if (newPwd !== confirmPwd) {
      this.forgotErrorMessage = 'Passwords do not match';
      return;
    }

    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = 'Password changed successfully. Redirecting to login...';
    this.forgotStep = 'success';

    // In a real app, call backend API to update password here

    setTimeout(() => {
      this.forgotMode = false;
      this.forgotStep = 'email';
      this.forgotSuccessMessage = '';
      this.resetPasswordForm.reset();
      this.forgotOtpForm.reset();
    }, 2000);
  }
}
