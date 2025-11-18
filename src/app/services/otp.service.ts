import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG, getApiUrl } from '../config/api.config';

export type PendingRole = 'vendor' | 'company';

export interface PendingUserData {
  role: PendingRole;
  email: string;
  payload: any; // vendor or company data object
}

@Injectable({ providedIn: 'root' })
export class OtpService {
  private pendingUser: PendingUserData | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Start OTP flow by calling backend signup/OTP endpoint.
   * Stores pending user data locally so we can save it after OTP verification.
   */
  async startOtpFlow(data: PendingUserData): Promise<void> {
    this.pendingUser = data;
    const url = getApiUrl(API_CONFIG.OTP.SIGNUP);

    // Send the complete user data to backend /signup endpoint
    const body = data.payload;
    await firstValueFrom(
      this.http.post(url, body, { responseType: 'text' as 'json' })
    );
  }

  getPendingUser(): PendingUserData | null {
    return this.pendingUser;
  }

  /**
   * Verify OTP with backend.
   * Backend expects: { mail: string, otp: string }
   */
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const url = getApiUrl(API_CONFIG.OTP.VERIFY);
    const body = { mail: email, otp: otp };
    await firstValueFrom(
      this.http.post(url, body, { responseType: 'text' as 'json' })
    );
    return true;
  }

  /**
   * Resend OTP via backend.
   * Backend GET endpoint expects 'mail' query parameter
   */
  async resendOtp(email: string): Promise<void> {
    const url = getApiUrl(API_CONFIG.OTP.RESEND) + `?mail=${encodeURIComponent(email)}`;
    await firstValueFrom(
      this.http.get(url, { responseType: 'text' as 'json' })
    );
  }

  clear(): void {
    this.pendingUser = null;
  }
}
