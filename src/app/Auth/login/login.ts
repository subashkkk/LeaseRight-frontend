import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { slideInAnimation, fadeInAnimation } from '../auth.animations';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔍 Login component ngOnInit called');
    console.log('📍 Current URL:', this.router.url);
    
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
    this.router.navigate(['/auth/forgot-password']);
  }
}
