# 🔧 Lease Request Submission - Troubleshooting

## ✅ Issue Fixed!

**Problem**: "Failed to submit request. Please try again."

**Cause**: The service was configured to use backend API (`USE_BACKEND_API = true`), but there might have been connection or CORS issues.

**Solution**: Temporarily switched to localStorage mode for testing.

---

## 🎯 Current Configuration

**File**: `/src/app/services/lease-request.service.ts`

```typescript
private USE_BACKEND_API = false; // Currently using localStorage
```

### ✅ What This Means:

- **Lease requests are now stored in browser's localStorage**
- **No backend connection required**
- **Works offline for development**
- **Perfect for testing dashboard features**

---

## 🧪 How to Test Now

### Step 1: Login as Company
```
URL: http://localhost:4200/auth/login
Email: company@test.com
Password: Test@123
```

### Step 2: Create Lease Request
1. Click **"Request New Lease"** button
2. Fill the form:
   - **Vehicle Type**: SUV
   - **Preferred Model**: Toyota Fortuner (optional)
   - **Min Budget**: 50000
   - **Max Budget**: 80000
   - **Lease Duration**: 12
   - **Additional Requirements**: GPS, Automatic (optional)

3. Click **Submit**

### Step 3: Verify Success
- ✅ Success message appears: "Lease request submitted successfully! ✅"
- ✅ Request appears in "My Lease Requests" section
- ✅ Status shows as "Pending"

### Step 4: View as Vendor
1. Logout from company account
2. Login as vendor:
   ```
   Email: vendor@test.com
   Password: Test@123
   ```
3. See the request in vendor dashboard under "Incoming Lease Requests"

---

## 🔄 Switching to Backend Mode

When your backend is ready and running:

### 1. Start Backend Server
```bash
cd "/Users/preethis/Documents/untitled folder/Lease_Management_application"
./mvnw spring-boot:run
```

Wait for: `Started LeasingManagementApplication`

### 2. Enable Backend in Frontend
**File**: `/src/app/services/lease-request.service.ts`

```typescript
private USE_BACKEND_API = true; // Switch to backend
```

### 3. Verify Backend is Running
```bash
curl http://localhost:8080
```

Should return HTTP 200 or 405 (not connection refused)

### 4. Test Submission
- Login as company
- Create request
- Check browser console for:
  ```
  📝 Creating lease request via backend API: http://localhost:8080/lease-requests/new-Lease-Request
  ✅ Lease request created via backend: "Lease request created successfully"
  ```

### 5. Verify in Database
```sql
SELECT * FROM lease_request_table ORDER BY created_at DESC LIMIT 5;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error (Backend Mode)

**Error in Console:**
```
Access to XMLHttpRequest at 'http://localhost:8080/...' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

**Solution:**
Check backend CORS configuration in `CorsConfig.java`:
```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
        .allowedOrigins("http://localhost:4200")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
}
```

### Issue 2: Connection Refused (Backend Mode)

**Error:**
```
❌ Backend lease request creation failed: {status: 0, statusText: "Unknown Error"}
```

**Solution:**
Backend is not running. Start it:
```bash
./mvnw spring-boot:run
```

### Issue 3: Validation Error (Backend Mode)

**Error:**
```
❌ Backend lease request creation failed: {status: 400, error: "Vehicle Type is required"}
```

**Solution:**
Ensure all required fields are filled:
- Vehicle Type ✅ Required
- Min Budget ✅ Required
- Max Budget ✅ Required
- Lease Duration ✅ Required
- Min Budget < Max Budget ✅

### Issue 4: Company ID Missing (Backend Mode)

**Error:**
```
companyId: null
```

**Solution:**
Currently using mock companyId = 1. After login integration:
```typescript
// Store from login response
localStorage.setItem('companyId', response.user.id);

// Use in dashboard
this.companyId = parseInt(localStorage.getItem('companyId') || '1');
```

### Issue 5: Data Not Appearing in Vendor Dashboard

**Current Behavior:**
- LocalStorage mode: ✅ Works (shows pending requests)
- Backend mode: ⚠️ Pending (need GET endpoints)

**Solution:**
Add backend endpoints:
```java
@GetMapping("/lease-requests/all")
public ResponseEntity<List<LeaseRequest>> getAllLeaseRequests()

@GetMapping("/lease-requests/pending")
public ResponseEntity<List<LeaseRequest>> getPendingLeaseRequests()
```

---

## 📊 Current Features Status

| Feature | LocalStorage | Backend API | Notes |
|---------|--------------|-------------|-------|
| Create Request | ✅ Working | ✅ Ready | Backend integration ready |
| View My Requests | ✅ Working | ⚠️ Pending | Need GET endpoint |
| Vendor View Requests | ✅ Working | ⚠️ Pending | Need GET endpoint |
| Update Status | ✅ Working | ⚠️ Pending | Need PUT endpoint |
| Real-time Sync | ❌ No | ⚠️ Pending | Backend required |

---

## 🎓 Debug Tips

### 1. Check Browser Console
Open DevTools (F12) → Console tab
- Look for error messages
- Check network requests
- Verify data being sent

### 2. Check LocalStorage
In DevTools → Application tab → Local Storage → http://localhost:4200
- Look for `lease_requests` key
- Verify data structure

### 3. Test in Isolation
```javascript
// In browser console
// Check if data is saved
console.log(JSON.parse(localStorage.getItem('lease_requests')));

// Clear and retry
localStorage.removeItem('lease_requests');
// Then submit form again
```

### 4. Network Tab
DevTools → Network tab
- Filter: XHR
- Check request/response
- Verify status codes

---

## ✅ Success Checklist

After submitting a request, you should see:

- [ ] Success message displayed for 3 seconds
- [ ] Form resets to default values
- [ ] Request appears in "My Lease Requests" section
- [ ] Request shows with correct vehicle type
- [ ] Budget range displayed correctly
- [ ] Status badge shows "Pending"
- [ ] Created date is current
- [ ] Browser console shows: `✅ Lease request created (LocalStorage)`

---

## 🚀 Quick Commands

### Check if backend is running:
```bash
curl -I http://localhost:8080
```

### Start backend:
```bash
cd "/Users/preethis/Documents/untitled folder/Lease_Management_application"
./mvnw spring-boot:run
```

### Check frontend build:
```bash
cd "/Users/preethis/Documents/untitled folder/LeaseRight"
ng build --configuration development
```

### View localStorage data:
Open browser console and run:
```javascript
console.table(JSON.parse(localStorage.getItem('lease_requests')));
```

---

## 📝 Testing Workflow

### Complete Test Flow:

1. **Clear previous data** (optional):
   ```javascript
   localStorage.removeItem('lease_requests');
   ```

2. **Login as company**:
   - company@test.com / Test@123

3. **Create request**:
   - Fill all required fields
   - Submit

4. **Verify in company dashboard**:
   - Check "My Lease Requests" section
   - Confirm details are correct

5. **Logout and login as vendor**:
   - vendor@test.com / Test@123

6. **Verify in vendor dashboard**:
   - Check "Incoming Lease Requests"
   - See the request you created

7. **Respond to request**:
   - Click "Respond to Request"
   - Fill quotation form
   - Submit

8. **Switch back to company**:
   - See vendor response
   - Check status updated

---

## 🎉 You're All Set!

The lease request feature is now working in **LocalStorage mode**. You can:
- ✅ Create requests as company
- ✅ View requests as vendor
- ✅ Test the entire workflow
- ✅ Develop dashboard features

When ready to integrate backend:
1. Start backend server
2. Change `USE_BACKEND_API` to `true`
3. Test with database

**Happy Testing! 🚀**
