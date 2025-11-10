# Backend Integration Guide

## Current Setup (LocalStorage)

Your vendor registration system currently uses **LocalStorage** to store data. This is perfect for development and testing.

### Where Data is Stored

- **Location**: Browser's LocalStorage (F12 → Application → Local Storage)
- **Key**: `vendor_registrations`
- **Format**: JSON array of vendor objects
- **Backup**: JSON files automatically downloaded to Downloads folder

### Data Structure

```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "companyName": "ABC Leasing Co.",
    "password": "password123",
    "role": "vendor",
    "registeredAt": "2025-11-09T10:41:23.456Z"
  }
]
```

---

## How to Migrate to Backend API

When your backend is ready, follow these steps:

### Step 1: Update app.config.ts

Add `HttpClient` provider:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    provideHttpClient()  // Add this
  ]
};
```

### Step 2: Update vendor-data.service.ts

Uncomment the HTTP imports and implementation:

```typescript
// At the top of the file:
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// In the constructor:
constructor(private http: HttpClient) {}

// Replace the saveVendorData method:
saveVendorData(vendorData: VendorData): Observable<any> {
  return this.http.post(this.API_URL, vendorData);
}

// Replace getAllVendors method:
getAllVendors(): Observable<VendorData[]> {
  return this.http.get<VendorData[]>(this.API_URL);
}
```

### Step 3: Update signup-vendor.ts

Change the Promise handling to Observable:

```typescript
// Instead of .then()
this.vendorDataService.saveVendorData(vendorData).subscribe({
  next: (response) => {
    this.isLoading = false;
    this.successMessage = 'Vendor registration successful!';
    // ... rest of success handling
  },
  error: (error) => {
    this.isLoading = false;
    this.errorMessage = 'Registration failed. Please try again.';
    console.error('❌ Registration error:', error);
  }
});
```

### Step 4: Backend API Endpoints Needed

Your backend should implement these endpoints:

```
POST   /api/vendors              → Create new vendor
GET    /api/vendors              → Get all vendors
GET    /api/vendors/:email       → Get vendor by email
DELETE /api/vendors/:email       → Delete vendor
PUT    /api/vendors/:email       → Update vendor
```

---

## Backend API Example (Node.js/Express)

Here's a basic Express server setup:

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_FILE = './data/vendors.json';

// Create vendor
app.post('/api/vendors', (req, res) => {
  const vendors = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const newVendor = req.body;
  
  // Check duplicate email
  if (vendors.find(v => v.email === newVendor.email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  vendors.push(newVendor);
  fs.writeFileSync(DATA_FILE, JSON.stringify(vendors, null, 2));
  
  res.status(201).json({ success: true, message: 'Vendor created' });
});

// Get all vendors
app.get('/api/vendors', (req, res) => {
  const vendors = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(vendors);
});

// Get vendor by email
app.get('/api/vendors/:email', (req, res) => {
  const vendors = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const vendor = vendors.find(v => v.email === req.params.email);
  
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found' });
  }
  
  res.json(vendor);
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
```

---

## Current Features

✅ **LocalStorage persistence** - Data survives page refresh
✅ **Duplicate email check** - Prevents duplicate registrations
✅ **JSON file download** - Backup files automatically downloaded
✅ **Easy migration path** - Service layer ready for API integration
✅ **No component changes needed** - Only service file needs updating

---

## Testing LocalStorage

### View Stored Data:
1. Open browser DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage**
4. Click on your site URL
5. Find `vendor_registrations` key

### Clear Data (for testing):
```javascript
// In browser console:
localStorage.removeItem('vendor_registrations');
```

Or use the service method:
```typescript
this.vendorDataService.clearAllVendors();
```

---

## Benefits of This Approach

1. **Development Ready** - Works immediately without backend
2. **Production Ready** - Easy to swap with API calls
3. **Clean Architecture** - Service layer separates concerns
4. **No Breaking Changes** - Components don't need updates
5. **Data Safety** - JSON files as backup
6. **Email Validation** - Duplicate checking built-in

---

## Questions?

When you're ready to implement the backend:
1. Set up your Express/Node.js server
2. Create the API endpoints
3. Update the service file as shown above
4. Test with Postman first
5. Update Angular service to use HTTP calls

Your current LocalStorage data can be exported and imported to the backend database!
