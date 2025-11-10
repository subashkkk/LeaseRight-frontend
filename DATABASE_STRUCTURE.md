# Database Structure

## Overview

The application uses **LocalStorage** to store user registration data in two separate databases based on signup type.

## Database Files

### 1. **Vendor Database**
- **LocalStorage Key**: `vendor_registrations`
- **Location**: Browser LocalStorage
- **Reference File**: `/src/assets/data/vendors.json` (template)
- **Service**: `VendorDataService`

### 2. **Company Database**
- **LocalStorage Key**: `company_registrations`
- **Location**: Browser LocalStorage
- **Reference File**: `/src/assets/data/companies.json` (template)
- **Service**: `CompanyDataService`

---

## Data Structure

### Vendor Registration Data

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "companyName": "string",
  "password": "string",
  "role": "vendor",
  "registeredAt": "ISO 8601 timestamp"
}
```

**Example:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@vendorcompany.com",
  "companyName": "ABC Leasing Solutions",
  "password": "password123",
  "role": "vendor",
  "registeredAt": "2025-11-09T11:00:00.000Z"
}
```

### Company Registration Data

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "companyName": "string",
  "password": "string",
  "role": "company",
  "registeredAt": "ISO 8601 timestamp"
}
```

**Example:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@techcorp.com",
  "companyName": "TechCorp Solutions",
  "password": "securepass456",
  "role": "company",
  "registeredAt": "2025-11-09T11:05:00.000Z"
}
```

---

## Storage Mechanism

### LocalStorage Keys

| Database | LocalStorage Key | Purpose |
|----------|------------------|---------|
| Vendors | `vendor_registrations` | Stores all vendor signups |
| Companies | `company_registrations` | Stores all company signups |

### Data Format

Both databases store data as **JSON arrays**:

```javascript
// vendor_registrations
[
  { vendor1_data },
  { vendor2_data },
  { vendor3_data }
]

// company_registrations
[
  { company1_data },
  { company2_data },
  { company3_data }
]
```

---

## Authentication Flow

### Registration

```
User Signup → Select Role (Vendor/Company)
    ↓
Fill Signup Form
    ↓
Data Service (VendorDataService or CompanyDataService)
    ↓
Save to appropriate LocalStorage key
    ↓
Download JSON backup file
```

### Login

```
User enters credentials (email + password)
    ↓
AuthService.login()
    ↓
Search in vendor_registrations
    ├─ Found? → Login as Vendor → Navigate to /home/vendor-dashboard
    └─ Not found? → Search in company_registrations
        ├─ Found? → Login as Company → Navigate to /home/company-dashboard
        └─ Not found? → Show error "Invalid credentials"
```

---

## Routing Based on User Type

### Vendor User
- **Role**: `vendor`
- **Dashboard Route**: `/home/vendor-dashboard`
- **Features**:
  - Manage vehicle inventory
  - View lease requests
  - Track active leases
  - Monthly revenue statistics

### Company User
- **Role**: `company`
- **Dashboard Route**: `/home/company-dashboard`
- **Features**:
  - Browse available vehicles
  - Request new leases
  - View leased vehicles
  - Track lease costs

---

## View Stored Data

### Browser DevTools

1. Press **F12** to open DevTools
2. Go to **Application** tab
3. Expand **Local Storage**
4. Click on your site URL
5. Find keys:
   - `vendor_registrations`
   - `company_registrations`

### Console Commands

```javascript
// View all vendors
JSON.parse(localStorage.getItem('vendor_registrations'))

// View all companies
JSON.parse(localStorage.getItem('company_registrations'))

// Count vendors
JSON.parse(localStorage.getItem('vendor_registrations')).length

// Count companies
JSON.parse(localStorage.getItem('company_registrations')).length

// Clear vendor data (testing)
localStorage.removeItem('vendor_registrations')

// Clear company data (testing)
localStorage.removeItem('company_registrations')
```

---

## Data Management Services

### VendorDataService (`src/app/services/vendor-data.service.ts`)

**Methods:**
- `saveVendorData(vendorData)` - Save vendor registration
- `getAllVendors()` - Get all vendors
- `getVendorByEmail(email)` - Find specific vendor
- `isEmailRegistered(email)` - Check if email exists
- `downloadVendorAsJson(vendorData)` - Download JSON backup
- `clearAllVendors()` - Clear all vendor data

### CompanyDataService (`src/app/services/company-data.service.ts`)

**Methods:**
- `saveCompanyData(companyData)` - Save company registration
- `getAllCompanies()` - Get all companies
- `getCompanyByEmail(email)` - Find specific company
- `isEmailRegistered(email)` - Check if email exists
- `downloadCompanyAsJson(companyData)` - Download JSON backup
- `clearAllCompanies()` - Clear all company data

### AuthService (`src/app/Auth/auth.service.ts`)

**Methods:**
- `login(credentials)` - Authenticate user (checks both databases)
- `logout()` - Clear authentication and redirect
- `isAuthenticated()` - Check if user is logged in
- `getUserRole()` - Get current user role (vendor/company)
- `getUserName()` - Get current user name
- `getUser()` - Get full user object

---

## Database Separation Benefits

✅ **Clear Data Segregation** - Vendors and companies stored separately
✅ **Role-Based Access** - Easy to implement role-specific features
✅ **Scalable Architecture** - Easy to add more user types
✅ **Independent Management** - Each database can be managed independently
✅ **Security** - Role verification prevents unauthorized access
✅ **Easy Migration** - Clean structure for backend integration

---

## Backup System

### Automatic JSON File Downloads

Every registration automatically downloads a JSON file:

**Vendor:**
- Filename: `vendor-{email-prefix}-{timestamp}.json`
- Location: Downloads folder

**Company:**
- Filename: `company-{email-prefix}-{timestamp}.json`
- Location: Downloads folder

### Manual Database Export

```javascript
// Export all vendors
const vendors = JSON.parse(localStorage.getItem('vendor_registrations'));
const blob = new Blob([JSON.stringify(vendors, null, 2)], { type: 'application/json' });
// Download blob...

// Export all companies
const companies = JSON.parse(localStorage.getItem('company_registrations'));
const blob = new Blob([JSON.stringify(companies, null, 2)], { type: 'application/json' });
// Download blob...
```

---

## Future Backend Integration

When migrating to a backend database:

1. **Keep the same data structure**
2. **Update service methods** to use HTTP calls
3. **No changes needed** in components
4. **Maintain role-based routing**

See `BACKEND_INTEGRATION_GUIDE.md` for detailed migration steps.

---

## Testing

### Test Vendor Registration & Login

```
1. Go to /auth/signup-vendor
2. Register: john@vendor.com / password123
3. Check LocalStorage: vendor_registrations
4. Check Downloads folder for JSON file
5. Login at /auth/login
6. Verify redirect to /home/vendor-dashboard
```

### Test Company Registration & Login

```
1. Go to /auth/signup-company
2. Register: jane@company.com / password123
3. Check LocalStorage: company_registrations
4. Check Downloads folder for JSON file
5. Login at /auth/login
6. Verify redirect to /home/company-dashboard
```

### Test Role-Based Access

```
1. Login as Vendor
2. Try accessing /home/company-dashboard
3. Should be redirected to login (access denied)

1. Login as Company
2. Try accessing /home/vendor-dashboard
3. Should be redirected to login (access denied)
```

---

## Summary

- ✅ Two separate databases (vendors & companies)
- ✅ LocalStorage-based storage
- ✅ Role-based authentication
- ✅ Dynamic routing based on user type
- ✅ Automatic JSON backups
- ✅ Backend-ready architecture
