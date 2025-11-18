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
      console.error('OTP verification failed', e);
      // Show the actual backend error message if available
      if (e.error && typeof e.error === 'string') {
        this.error = e.error;
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

    try {
      await this.otpService.resendOtp(this.email);
      this.message = 'A new OTP has been sent to your email.';
    } catch (e: any) {
      console.error('Error resending OTP', e);
      // Show the actual backend error message if available
      if (e.error && typeof e.error === 'string') {
        this.error = e.error;
      } else if (e.message) {
        this.error = e.message;
      } else {
        this.error = 'Failed to resend OTP. Please try again.';
      }
    }
  }
}
