# 🧪 Lease Request Integration - Testing Guide

## 🎯 Quick Start

Follow these steps to test the integrated lease request feature:

---

## Step 1: Start Backend Server

```bash
# Navigate to backend project
cd "/Users/preethis/Documents/untitled folder/Lease_Management_application"

# Run Spring Boot application
./mvnw spring-boot:run
```

**Wait for:** `Started LeasingManagementApplication` message

**Verify:** Backend running on `http://localhost:8080`

---

## Step 2: Start Frontend Server (Already Running)

Your frontend is already running on `http://localhost:4200`

If not, start it:
```bash
cd "/Users/preethis/Documents/untitled folder/LeaseRight"
ng serve
```

---

## Step 3: Test the Integration

### Option A: Using Test Credentials

1. **Open** `http://localhost:4200/auth/login`

2. **Login as Company:**
   ```
   Email: company@test.com
   Password: Test@123
   ```

3. **Click** "Request New Lease" button

4. **Fill the form:**
   ```
   Vehicle Type: SUV
   Preferred Model: Toyota Fortuner
   Minimum Budget: 50000
   Maximum Budget: 80000
   Lease Duration: 12
   Additional Requirements: GPS, Automatic, Leather seats
   ```

5. **Submit** and watch browser console:
   ```
   📝 Creating lease request via backend API: http://localhost:8080/lease-requests/new-Lease-Request
   📦 Request data: {...}
   ✅ Lease request created via backend: "Lease request created successfully"
   ```

### Option B: Using API Testing Tool (Postman/cURL)

```bash
curl -X POST http://localhost:8080/lease-requests/new-Lease-Request \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "SUV",
    "preferredModel": "Toyota Fortuner",
    "leaseDuration": 12,
    "minBudget": 50000,
    "maxBudget": 80000,
    "additionalRequirements": "GPS, Automatic",
    "companyId": 1
  }'
```

**Expected Response:** `"Lease request created successfully"`

---

## Step 4: Verify in Database

### Using MySQL Command Line:

```sql
-- Connect to database
mysql -u root -p

-- Select database
USE lease_management;

-- View all lease requests
SELECT * FROM lease_request_table;

-- View latest request
SELECT * FROM lease_request_table 
ORDER BY created_at DESC 
LIMIT 1;

-- View with company details
SELECT 
  lr.id,
  lr.vehicle_type,
  lr.preferred_model,
  lr.lease_duration,
  lr.min_budget,
  lr.max_budget,
  lr.additional_requirements,
  lr.created_at,
  u.company_name
FROM lease_request_table lr
LEFT JOIN user_entity u ON lr.company_id = u.id
ORDER BY lr.created_at DESC;
```

---

## 🔍 What to Check

### ✅ Frontend Checklist

- [ ] Form shows all 8 vehicle types (SUV, SEDAN, HATCHBACK, CUV, MUV, PICKUP, SPORTS, LUXURY)
- [ ] Form validates min/max budget range
- [ ] Form requires vehicle type, min budget, max budget, lease duration
- [ ] Preferred model and additional requirements are optional
- [ ] Submit button disabled when form invalid
- [ ] Success message appears after submission
- [ ] Browser console shows POST request to backend
- [ ] No CORS errors in console

### ✅ Backend Checklist

- [ ] Backend server running on port 8080
- [ ] Endpoint `/lease-requests/new-Lease-Request` accessible
- [ ] Request validates all required fields
- [ ] Budget range validation (min <= max)
- [ ] Lease duration converted (12 → "1 year")
- [ ] Record saved in `lease_request_table`
- [ ] Created timestamp auto-generated
- [ ] Company association (FK) working

### ✅ Database Checklist

- [ ] New record in `lease_request_table`
- [ ] All fields populated correctly
- [ ] `vehicle_type` matches enum value (e.g., "SUV")
- [ ] `lease_duration` formatted (e.g., "1 year")
- [ ] `company_id` links to valid company
- [ ] `created_at` timestamp present
- [ ] Budget values stored as decimals

---

## 📊 Expected Data Flow

```
┌─────────────────┐
│  Company User   │
│  fills form     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend: company-dashboard.ts          │
│ - Validates form                        │
│ - Prepares LeaseRequestDTO              │
│ - Calls leaseService.createLeaseRequest │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Service: lease-request.service.ts       │
│ - Formats data for backend              │
│ - POST to /lease-requests/new-Lease-... │
└────────┬────────────────────────────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────────────────────────────┐
│ Backend: LeaseRequestController         │
│ - @PostMapping("/new-Lease-Request")    │
│ - Validates @Valid @RequestBody DTO     │
│ - Calls service.createLeaseRequest()    │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Backend: LeaseRequestService            │
│ - Converts DTO to Entity                │
│ - Validates business rules              │
│ - Saves to repository                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Database: lease_request_table           │
│ - New record inserted                   │
│ - Auto-increment ID                     │
│ - Timestamp generated                   │
└─────────────────────────────────────────┘
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
```
Access to XMLHttpRequest at 'http://localhost:8080/lease-requests/new-Lease-Request' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solution:** Check `CorsConfig.java` in backend:
```java
.allowedOrigins("http://localhost:4200")
```

### Issue 2: Backend Not Running
```
ERR_CONNECTION_REFUSED
```

**Solution:** Start backend server:
```bash
cd "/Users/preethis/Documents/untitled folder/Lease_Management_application"
./mvnw spring-boot:run
```

### Issue 3: Validation Error
```
"Vehicle Type is required"
"Minimum budget cannot be greater than maximum budget"
```

**Solution:** Ensure all required fields are filled and budget range is valid

### Issue 4: CompanyId Null
```
companyId: null in database
```

**Solution:** Currently using mock `companyId = 1`. After login integration, update:
```typescript
// Store companyId from login response
localStorage.setItem('companyId', response.user.id);
```

---

## 📋 Test Cases

### Test Case 1: Valid Request
**Input:**
```json
{
  "vehicleType": "SUV",
  "preferredModel": "Toyota Fortuner",
  "leaseDuration": 12,
  "minBudget": 50000,
  "maxBudget": 80000,
  "additionalRequirements": "GPS, Automatic",
  "companyId": 1
}
```
**Expected:** ✅ Success, saved to database

### Test Case 2: Invalid Budget Range
**Input:**
```json
{
  "vehicleType": "SEDAN",
  "leaseDuration": 24,
  "minBudget": 80000,
  "maxBudget": 50000,  // Less than min!
  "companyId": 1
}
```
**Expected:** ❌ Error "Minimum budget cannot be greater than maximum budget"

### Test Case 3: Missing Required Field
**Input:**
```json
{
  "preferredModel": "Honda City",
  "leaseDuration": 12,
  "minBudget": 30000,
  "maxBudget": 40000,
  "companyId": 1
  // Missing vehicleType!
}
```
**Expected:** ❌ Error "Vehicle Type is required"

### Test Case 4: Optional Fields
**Input:**
```json
{
  "vehicleType": "LUXURY",
  "leaseDuration": 36,
  "minBudget": 100000,
  "maxBudget": 150000,
  "companyId": 1
  // No preferredModel or additionalRequirements
}
```
**Expected:** ✅ Success, optional fields are null/empty

---

## 🎓 Debug Tips

### 1. Browser Console
```javascript
// Check request payload
console.log('📤 Request:', requestData);

// Check response
console.log('📥 Response:', response);
```

### 2. Network Tab (Chrome DevTools)
- Open DevTools (F12)
- Go to Network tab
- Filter: XHR
- Look for: `new-Lease-Request`
- Check: Request payload, Response, Status code

### 3. Backend Logs
```bash
# Watch backend logs
tail -f logs/application.log

# Or in Spring Boot console
# Look for: "Creating lease request..."
```

### 4. Database Queries
```sql
-- Count total requests
SELECT COUNT(*) FROM lease_request_table;

-- Latest 5 requests
SELECT * FROM lease_request_table 
ORDER BY created_at DESC 
LIMIT 5;

-- Requests by vehicle type
SELECT vehicle_type, COUNT(*) 
FROM lease_request_table 
GROUP BY vehicle_type;
```

---

## ✅ Success Criteria

You'll know the integration is working when:

1. ✅ Form submission shows success message
2. ✅ Browser console shows POST request with 200 status
3. ✅ Database has new record in `lease_request_table`
4. ✅ All fields match the form input
5. ✅ Lease duration is formatted (e.g., "1 year")
6. ✅ Created timestamp is set
7. ✅ Company association is correct

---

## 🚀 Ready to Test!

1. **Start backend**: `./mvnw spring-boot:run`
2. **Open app**: `http://localhost:4200`
3. **Login**: `company@test.com` / `Test@123`
4. **Create request** and check console + database
5. **Celebrate** 🎉 if it works!

---

**Need Help?** Check `LEASE_REQUEST_INTEGRATION.md` for detailed documentation.
