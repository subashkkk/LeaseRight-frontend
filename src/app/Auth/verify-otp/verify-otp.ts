import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OtpService } from '../../services/otp.service';
import { API_CONFIG, getApiUrl } from '../../config/api.config';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtp {
  email = '';
  role: 'vendor' | 'company' | null = null;
  otpInput = '';
  message = '';
  error = '';
  isVerifying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private otpService: OtpService,
    private http: HttpClient
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email') || '';
      const roleParam = params.get('role');
      this.role = roleParam === 'vendor' || roleParam === 'company' ? roleParam : null;
    });
  }

  async onVerify(): Promise<void> {
    this.error = '';
    this.message = '';

    const pending = this.otpService.getPendingUser();
    if (!pending || !this.role || pending.email !== this.email || pending.role !== this.role) {
      this.error = 'OTP session expired. Please sign up again.';
      return;
    }

    if (!this.otpInput) {
      this.error = 'Please enter the OTP.';
      return;
    }

    this.isVerifying = true;

    try {
      // Verify OTP with backend (this sets isVerified=true in the backend)
      // User is already saved in DB during signup with isVerified=false
      await this.otpService.verifyOtp(this.email, this.otpInput);

      this.message = 'OTP verified successfully! Account created.';
      this.otpService.clear();

      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
    } catch (e: any) {
      console.error('OTP verification failed:', e);
      
      // Handle HttpErrorResponse properly
      if (e.error) {
        // If error is a string (backend sends plain text)
        if (typeof e.error === 'string') {
          this.error = e.error;
        }
        // If error is an object with a message property
        else if (e.error.message && typeof e.error.message === 'string') {
          this.error = e.error.message;
        }
        // If error is an object with an error property
        else if (e.error.error && typeof e.error.error === 'string') {
          this.error = e.error.error;
        }
        // Fallback to status text
        else if (e.statusText) {
          this.error = e.statusText;
        }
        else {
          this.error = 'Invalid OTP. Please try again.';
        }
      } else if (e.message) {
        this.error = e.message;
      } else {
        this.error = 'Invalid OTP. Please try again.';
      }
    } finally {
      this.isVerifying = false;
    }
  }

  async resendOtp(): Promise<void> {
    this.error = '';
    this.message = '';

    const pending = this.otpService.getPendingUser();
    if (!pending) {
      this.error = 'Session expired. Please sign up again.';
      return;
    }

    console.log('📧 Resending OTP to:', this.email);
    
    try {
      await this.otpService.resendOtp(this.email);
      this.message = 'A new OTP has been sent to your email.';
      console.log('✅ OTP resent successfully');
    } catch (e: any) {
      console.error('❌ Error resending OTP:', e);
      console.error('Error structure:', {
        error: e.error,
        status: e.status,
        statusText: e.statusText,
        message: e.message
      });
      
      // Handle HttpErrorResponse properly
      if (e.error) {
        // If error is a string (backend sends plain text)
        if (typeof e.error === 'string') {
          this.error = e.error;
        }
        // If error is an object with a message property
        else if (e.error.message && typeof e.error.message === 'string') {
          this.error = e.error.message;
        }
        // If error is an object with an error property
        else if (e.error.error && typeof e.error.error === 'string') {
          this.error = e.error.error;
        }
        // Fallback to status text
        else if (e.statusText) {
          this.error = e.statusText;
        }
        else {
          this.error = 'Failed to resend OTP. Please try again.';
        }
      } else if (e.message) {
        this.error = e.message;
      } else {
        this.error = 'Failed to resend OTP. Please try again.';
      }
    }
  }
}
