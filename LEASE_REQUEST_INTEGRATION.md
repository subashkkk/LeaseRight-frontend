# 🚗 Lease Request Backend Integration Guide

## ✅ What Has Been Integrated

The lease request feature has been successfully integrated with your backend API. Here's what's been configured:

### 1. **Backend Endpoint Integration**

| Feature | Endpoint | Method | Status |
|---------|----------|--------|--------|
| Create Lease Request | `/lease-requests/new-Lease-Request` | POST | ✅ Integrated |
| Update Lease Request | `/lease-requests/:id` | PUT | ⚠️ Available |

### 2. **Data Structure Matching**

#### Backend LeaseRequestDTO Fields:
```java
- vehicleType: VehicleType (enum)
- preferredModel: String (optional)
- leaseDuration: Integer (in months)
- minBudget: Double
- maxBudget: Double
- additionalRequirements: String (optional)
- companyId: Long
```

#### Frontend LeaseRequest Interface:
```typescript
{
  vehicleType: VehicleType;
  preferredModel?: string;
  leaseDuration: number;
  minBudget: number;
  maxBudget: number;
  additionalRequirements?: string;
  companyId?: number;
}
```

✅ **Fields are now perfectly matched!**

### 3. **Vehicle Types (from Backend Enum)**

The following vehicle types are now available in the frontend dropdown:

- **SUV** - Sport Utility Vehicle
- **SEDAN** - Sedan
- **HATCHBACK** - Hatchback
- **CUV** - Crossover Utility Vehicle
- **MUV** - Multi Utility Vehicle
- **PICKUP** - Pickup Truck
- **SPORTS** - Sports Car
- **LUXURY** - Luxury Vehicle

These exactly match the `VehicleType` enum in your backend:
```java
public enum VehicleType {
    SUV, SEDAN, HATCHBACK, CUV, MUV, PICKUP, SPORTS, LUXURY
}
```

---

## 🎯 How It Works

### Step 1: Company Creates a Lease Request

1. **Login as Company**
   - Email: `company@test.com`
   - Password: `Test@123`

2. **Navigate to Company Dashboard**
   - Click "Request New Lease" button

3. **Fill Out the Form**
   ```
   Vehicle Type: SUV (or any other type)
   Preferred Model: Toyota Fortuner (optional)
   Minimum Budget: ₹50,000
   Maximum Budget: ₹80,000
   Lease Duration: 12 months
   Additional Requirements: GPS, Automatic, Sunroof (optional)
   ```

4. **Submit Request**
   - Form validates budget range (min < max)
   - Data is sent to backend: `POST http://localhost:8080/lease-requests/new-Lease-Request`
   - Backend validates, converts lease duration (12 → "1 year"), and saves to database

### Step 2: Request is Stored in Database

The backend:
- Validates all required fields
- Checks budget range (minBudget ≤ maxBudget)
- Converts lease duration (e.g., 12 months → "1 year", 24 months → "2 years")
- Associates request with company (using `companyId`)
- Saves to `lease_request_table`
- Returns success message

### Step 3: Vendor Views Request (TODO)

**Note**: Vendor dashboard currently shows requests from localStorage. Backend endpoint to fetch all lease requests for vendors is pending.

To implement:
```java
// Backend Controller needed
@GetMapping("/lease-requests/all")
public ResponseEntity<List<LeaseRequest>> getAllLeaseRequests()

// Or for specific vendor
@GetMapping("/lease-requests/pending")
public ResponseEntity<List<LeaseRequest>> getPendingLeaseRequests()
```

---

## 📝 API Configuration

### Base URL
```typescript
BASE_URL: 'http://localhost:8080'
```

### Lease Request Endpoints
```typescript
LEASE_REQUEST: {
  CREATE: '/lease-requests/new-Lease-Request',  // ✅ Integrated
  UPDATE: '/lease-requests/:id',                // Available
  GET_ALL: '/lease-requests/all',               // TODO: Backend
  GET_PENDING: '/lease-requests/pending',       // TODO: Backend
}
```

---

## 🔧 Configuration Settings

### Enable/Disable Backend Integration

**File**: `/src/app/services/lease-request.service.ts`

```typescript
private USE_BACKEND_API = true;  // ✅ Currently ENABLED
```

- **`true`**: Uses backend API (`http://localhost:8080`)
- **`false`**: Uses localStorage (for offline testing)

---

## 🧪 Testing the Integration

### Prerequisites

1. **Backend Server Running**
   ```bash
   # In your backend project
   cd "/Users/preethis/Documents/untitled folder/Lease_Management_application"
   ./mvnw spring-boot:run
   ```
   Server should be running on: `http://localhost:8080`

2. **Frontend Server Running**
   ```bash
   # In your frontend project
   cd "/Users/preethis/Documents/untitled folder/LeaseRight"
   ng serve
   ```
   App available at: `http://localhost:4200`

### Test Steps

1. **Login as Company**
   ```
   URL: http://localhost:4200/auth/login
   Email: company@test.com
   Password: Test@123
   ```

2. **Create Lease Request**
   - Click "Request New Lease"
   - Fill all required fields (marked with *)
   - Submit form

3. **Check Browser Console**
   ```javascript
   📝 Creating lease request via backend API: http://localhost:8080/lease-requests/new-Lease-Request
   📦 Request data: { vehicleType: "SUV", ... }
   ✅ Lease request created via backend: "Lease request created successfully"
   ```

4. **Verify in Database**
   ```sql
   SELECT * FROM lease_request_table ORDER BY created_at DESC LIMIT 1;
   ```

5. **Check Network Tab** (Browser DevTools)
   - Request URL: `http://localhost:8080/lease-requests/new-Lease-Request`
   - Method: `POST`
   - Status: `200 OK`
   - Response: Success message

---

## 🐛 Troubleshooting

### Problem: "CORS Error"
**Solution**: Verify backend CORS configuration allows `http://localhost:4200`

```java
// In CorsConfig.java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("http://localhost:4200")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .allowCredentials(true);
}
```

### Problem: "companyId is null"
**Current Status**: Using mock `companyId = 1` for testing.

**Solution**: After backend login integration, store real `companyId` from login response:
```typescript
// In auth.service.ts, after login
localStorage.setItem('companyId', response.user.id);

// In company-dashboard.ts
this.companyId = parseInt(localStorage.getItem('companyId') || '0');
```

### Problem: "Validation errors"
**Check**:
- Vehicle type must be one of: SUV, SEDAN, HATCHBACK, CUV, MUV, PICKUP, SPORTS, LUXURY
- Min budget must be less than max budget
- Lease duration must be at least 1 month

### Problem: "Request not showing in vendor dashboard"
**Current Behavior**: Vendor dashboard shows localStorage requests only.

**Reason**: Backend GET endpoints for vendors not yet implemented.

**TODO**: Add backend endpoints:
```java
@GetMapping("/lease-requests/all")
@GetMapping("/lease-requests/pending")
```

---

## 📊 Field Mapping Reference

| Frontend Form Field | Backend DTO Field | Backend Entity Field | Type | Required |
|---------------------|-------------------|---------------------|------|----------|
| Vehicle Type | `vehicleType` | `vehicle_type` | Enum | ✅ Yes |
| Preferred Model | `preferredModel` | `preferred_model` | String(50) | ⚠️ No |
| Minimum Budget | `minBudget` | `min_budget` | Double | ✅ Yes |
| Maximum Budget | `maxBudget` | `max_budget` | Double | ✅ Yes |
| Lease Duration | `leaseDuration` | `lease_duration` | String | ✅ Yes |
| Additional Requirements | `additionalRequirements` | `additional_requirements` | String(255) | ⚠️ No |
| Company ID | `companyId` | `company_id` (FK) | Long | ✅ Yes |

### Backend Data Transformations

1. **Lease Duration**: Number → Formatted String
   ```
   Input: 12 → Output: "1 year"
   Input: 24 → Output: "2 years"
   ```
   (Handled by `@PrePersist` in backend entity)

2. **Budget Validation**: Checked in both frontend and backend
   ```
   minBudget <= maxBudget
   ```

3. **Created At**: Auto-generated by backend
   ```java
   @CreationTimestamp
   private LocalDateTime createdAt;
   ```

---

## 🚀 Next Steps

### Immediate (Already Done ✅)
- [x] Create lease request form with backend fields
- [x] Add vehicle types from backend enum
- [x] Integrate POST endpoint
- [x] Match field names exactly
- [x] Add budget range validation

### Short Term (TODO)
- [ ] Implement backend GET endpoints for vendors
- [ ] Get real `companyId` from login response
- [ ] Add lease request listing in vendor dashboard from backend
- [ ] Add status update functionality (approve/reject)

### Future Enhancements
- [ ] Real-time notifications for new requests
- [ ] File upload for requirements
- [ ] Multiple vehicle selection
- [ ] Search and filter requests

---

## 💡 Usage Example

### Creating a Request (Frontend Code)

```typescript
const requestData: LeaseRequest = {
  vehicleType: 'SUV',
  preferredModel: 'Toyota Fortuner',
  leaseDuration: 12,
  minBudget: 50000,
  maxBudget: 80000,
  additionalRequirements: 'GPS navigation, Automatic transmission',
  companyId: 1
};

this.leaseService.createLeaseRequest(requestData)
  .then(response => {
    console.log('✅ Success:', response.message);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
```

### Backend Request Handling

```java
@PostMapping("/new-Lease-Request")
public ResponseEntity<String> createLeaseRequest(@Valid @RequestBody LeaseRequestDTO dto) {
    LeaseRequest createdRequest = leaseRequestService.toEntity(dto);
    String leaseRequest = leaseRequestService.createLeaseRequest(createdRequest);
    return new ResponseEntity<>(leaseRequest, HttpStatus.OK);
}
```

---

## ✨ Summary

✅ **What Works Now:**
- Company can create lease requests
- Data is sent to backend API
- Backend validates and saves to database
- Vehicle types match backend enum
- Field names match backend DTO

⚠️ **What Needs Backend Work:**
- GET endpoints for fetching requests
- Real `companyId` from login
- Vendor request listing
- Status update endpoints

🎉 **Result**: You can now create lease requests that are stored in your database and ready to be viewed by vendors once you add the GET endpoints!

---

## 📞 Support

If you encounter any issues:
1. Check browser console for error messages
2. Check backend logs for validation errors
3. Verify CORS settings
4. Ensure backend is running on port 8080
5. Verify database connection

Happy coding! 🚀
