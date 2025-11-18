# Signup API Integration Summary

## Overview
Successfully integrated the frontend signup forms with the backend API, fixing field mapping issues and implementing proper GST validation with OTP flow.

## Backend API Endpoints

### 1. User Registration with GST Validation & OTP
- **Endpoint**: `POST /signup`
- **Purpose**: Create user account, validate GST, send OTP
- **Request Body**:
```json
{
  "name": "string",           // Company/Vendor name
  "mail": "string",           // Email address
  "contactNo": "string",      // 10-digit phone number
  "gstNo": "string",          // GST number (format: 22AAAAA0000A1Z5)
  "panNo": "string",          // PAN number (optional for company, required for vendor)
  "password": "string",       // Password (min 8 chars)
  "role": "string"            // "company" or "vendor"
}
```
- **Response**: `"Signup successful! Please verify OTP sent to your email."`
- **Backend Process**:
  - Validates GST number using external API
  - Saves user to database with `isVerified=false`
  - Generates and sends OTP to email

### 2. OTP Verification
- **Endpoint**: `POST /verify_OTP`
- **Purpose**: Verify OTP and activate account
- **Request Body**:
```json
{
  "mail": "string",
  "otp": "string"
}
```
- **Response**: `"Account Created successfully!"`
- **Backend Process**:
  - Validates OTP (5-minute expiry)
  - Sets `isVerified=true` in database

### 3. Resend OTP
- **Endpoint**: `GET /resend-otp`
- **Purpose**: Resend OTP to user's email
- **Response**: `"OTP resent successfully!"`

## Frontend Changes

### 1. API Configuration (`api.config.ts`)
Updated endpoint configurations:
```typescript
OTP: {
  SIGNUP: '/signup',           // POST - Create user, validate GST, send OTP
  VERIFY: '/verify_OTP',       // POST - Verify OTP and activate account
  RESEND: '/resend-otp'        // GET - Resend OTP to email
}
```

### 2. Company Signup Form
**Fixed Field Mapping Issues:**

| Old Field Name | New Field Name | Backend Field | Purpose |
|---------------|----------------|---------------|---------|
| `firstName` | `name` | `name` | Company name |
| `lastName` | `contactNo` | `contactNo` | Contact number (10 digits) |
| `email` | `mail` | `mail` | Email address |
| `companyName` | `gstNo` | `gstNo` | GST number |
| - | Added | `password` | Password |
| - | Added | `role` | Always "company" |

**Validation Patterns:**
- Contact Number: `^[0-9]{10}$`
- GST Number: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
- Email: Standard email validation
- Password: Minimum 8 characters

### 3. Vendor Signup Form
**Fixed Field Mapping:**

| Old Field Name | New Field Name | Backend Field | Purpose |
|---------------|----------------|---------------|---------|
| `companyName` | `name` | `name` | Vendor company name |
| `contactNumber` | `contactNo` | `contactNo` | Contact number (10 digits) |
| `email` | `mail` | `mail` | Email address |
| `gstNumber` | `gstNo` | `gstNo` | GST number |
| `panNumber` | `panNo` | `panNo` | PAN number |
| - | Updated | `password` | Password |
| - | Added | `role` | Always "vendor" |

**Validation Patterns:**
- Contact Number: `^[0-9]{10}$`
- GST Number: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
- PAN Number: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`

### 4. OTP Service (`otp.service.ts`)
Updated to properly communicate with backend:
- `startOtpFlow()`: Calls `/signup` endpoint with user data
- `verifyOtp()`: Calls `/verify_OTP` with `{ mail, otp }`
- `resendOtp()`: Calls GET `/resend-otp`

### 5. OTP Verification Component
Fixed flow to match backend:
- User data already saved during signup with `isVerified=false`
- OTP verification only updates `isVerified=true`
- Removed redundant data saving after OTP verification

## Complete User Registration Flow

### Step 1: User Fills Signup Form
**Fields Required:**
- Company/Vendor Name
- Contact Number (10 digits)
- Email Address
- GST Number (valid format)
- PAN Number (vendor only)
- Password (min 8 chars)
- Confirm Password

### Step 2: Click "Create Account"
**Frontend:**
1. Form validation (client-side)
2. Create data object with correct field names
3. Call `otpService.startOtpFlow()`

**Backend (`POST /signup`):**
1. Check if email already registered
2. Validate GST number using external API
3. Save user to database with `isVerified=false`
4. Generate 6-digit OTP (valid for 5 minutes)
5. Send OTP to user's email
6. Return success message

### Step 3: Enter OTP
**Frontend:**
1. User navigated to `/auth/verify-otp` page
2. User enters 6-digit OTP from email
3. Click "Verify OTP"

**Backend (`POST /verify_OTP`):**
1. Validate OTP against stored value
2. Check OTP expiry (5 minutes)
3. Set `isVerified=true` in database
4. Return success message

### Step 4: Account Activated
- User redirected to login page
- Can now login with email and password

## GST Validation

### For Both Roles (Company & Vendor)
The backend validates GST numbers using RapidAPI GST verification service:

1. **Format Validation**: 
   - Pattern: `22AAAAA0000A1Z5`
   - 15 characters total

2. **API Validation**:
   - Checks if GST is registered
   - Verifies GST status is "ACTIVE"
   - Returns error if GST is inactive or invalid

3. **Error Handling**:
   - "Invalid GST" - GST not found or wrong format
   - "GST is Inactive" - GST found but not active
   - Error message shown in signup form

## Error Handling

### Signup Errors
- Email already registered
- Invalid GST number
- GST verification API failure
- Network errors

### OTP Verification Errors
- Invalid OTP
- OTP expired (after 5 minutes)
- Session expired
- Network errors

## Testing the Integration

### 1. Start Backend Server
```bash
cd /Users/preethis/Documents/untitled\ folder/Lease_Management_application
./mvnw spring-boot:run
```

### 2. Start Frontend Server
```bash
cd /Users/preethis/Documents/untitled\ folder/LeaseRight
ng serve
```

### 3. Test Company Signup
1. Navigate to `http://localhost:4200/auth/signup-company`
2. Fill in all fields with valid data
3. Use a valid GST number format
4. Submit form
5. Check email for OTP
6. Enter OTP on verification page
7. Verify account is created and can login

### 4. Test Vendor Signup
1. Navigate to `http://localhost:4200/auth/signup-vendor`
2. Fill in all fields including PAN number
3. Use a valid GST number format
4. Submit form
5. Check email for OTP
6. Enter OTP on verification page
7. Verify account is created and can login

## Key Fixes Implemented

1. ✅ **Field Mapping**: All form fields now correctly map to backend `UserEntity` fields
2. ✅ **GST Validation**: Integrated with backend GST validation API
3. ✅ **OTP Flow**: Proper OTP generation, sending, and verification
4. ✅ **Data Persistence**: User data saved correctly to database
5. ✅ **Error Handling**: Proper error messages displayed to user
6. ✅ **Validation Patterns**: Client-side validation matches backend requirements

## Notes

- GST validation requires valid RapidAPI credentials in backend `application.properties`
- OTP expires after 5 minutes
- Email service must be configured in backend for OTP delivery
- Both company and vendor use the same signup flow with different roles
