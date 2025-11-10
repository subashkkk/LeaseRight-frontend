# Backend API Integration Guide

## ✅ Your Backend is Now Integrated!

Your Angular frontend is now configured to work with your backend API at `http://localhost:8080`.

---

## 📋 Current Configuration

### API Base URL
```typescript
BASE_URL: 'http://localhost:8080'
```

### Enabled Features
✅ HTTP Interceptor (automatically adds auth token)
✅ API Configuration centralized
✅ Backend toggle in all services
✅ Error handling and logging

---

## 🔧 How It Works

### 1. **API Configuration** (`/src/app/config/api.config.ts`)

All your backend endpoints are defined in one place:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  
  AUTH: {
    LOGIN: '/user/login',
    SIGNUP: '/user/addNewUser',
  },
  
  VENDOR: {
    REGISTER: '/vendor/register',
    GET_ALL: '/vendor/all',
  },
  
  COMPANY: {
    REGISTER: '/company/register',
    GET_ALL: '/company/all',
  },
  
  // ... more endpoints
}
```

### 2. **HTTP Interceptor** (`/src/app/interceptors/auth.interceptor.ts`)

Automatically adds authentication token to ALL API requests:

```typescript
Authorization: Bearer <your-token>
```

Also handles:
- ✅ 401 Unauthorized → Auto redirect to login
- ✅ 403 Forbidden → Show error message
- ✅ 500 Server Error → Show error message

### 3. **Service Toggle**

Each service has a `USE_BACKEND_API` flag:

**auth.service.ts:**
```typescript
private USE_BACKEND_API = true; // ✅ Using backend
```

**vendor-data.service.ts:**
```typescript
private USE_BACKEND_API = true; // ✅ Using backend
```

**company-data.service.ts:**
```typescript
private USE_BACKEND_API = true; // ✅ Using backend
```

Set to `false` to use LocalStorage (for testing without backend).

---

## 🔗 Expected Backend Endpoints

### Authentication Endpoints

#### 1. **Login**
```
POST http://localhost:8080/user/login

Request Body:
{
  "email": "john@vendor.com",
  "password": "password123"
}

Expected Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "john@vendor.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyName": "ABC Leasing"
  },
  "userRole": "vendor",  // or "company"
  "userName": "John Doe"
}
```

#### 2. **Signup/Register**
```
POST http://localhost:8080/user/addNewUser

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@vendor.com",
  "companyName": "ABC Leasing",
  "password": "password123",
  "role": "vendor"  // or "company"
}

Expected Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": { ...user data... }
}
```

### Vendor Endpoints

#### 3. **Register Vendor**
```
POST http://localhost:8080/vendor/register

Headers:
Authorization: Bearer <token>

Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@vendor.com",
  "companyName": "ABC Leasing",
  "password": "password123",
  "role": "vendor",
  "registeredAt": "2025-11-10T10:00:00.000Z"
}

Expected Response:
{
  "success": true,
  "message": "Vendor registered successfully",
  "data": { ...vendor data... }
}
```

#### 4. **Get All Vendors**
```
GET http://localhost:8080/vendor/all

Headers:
Authorization: Bearer <token>

Expected Response:
[
  {
    "id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@vendor.com",
    "companyName": "ABC Leasing",
    "role": "vendor"
  },
  ...
]
```

### Company Endpoints

#### 5. **Register Company**
```
POST http://localhost:8080/company/register

Headers:
Authorization: Bearer <token>

Request Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "companyName": "TechCorp",
  "password": "password123",
  "role": "company",
  "registeredAt": "2025-11-10T10:00:00.000Z"
}

Expected Response:
{
  "success": true,
  "message": "Company registered successfully",
  "data": { ...company data... }
}
```

#### 6. **Get All Companies**
```
GET http://localhost:8080/company/all

Headers:
Authorization: Bearer <token>

Expected Response:
[
  {
    "id": "1",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@company.com",
    "companyName": "TechCorp",
    "role": "company"
  },
  ...
]
```

### Lease Request Endpoints

#### 7. **Create Lease Request**
```
POST http://localhost:8080/lease-request/create

Headers:
Authorization: Bearer <token>

Request Body:
{
  "companyEmail": "jane@company.com",
  "companyName": "TechCorp",
  "contactPerson": "Jane Smith",
  "vehicleType": "SUV",
  "quantity": 2,
  "leaseDuration": 12,
  "startDate": "2025-12-01",
  "budget": 1200,
  "description": "Need 2 SUVs for sales team"
}

Expected Response:
{
  "success": true,
  "message": "Lease request created",
  "data": {
    "id": "req123",
    ...request data...,
    "status": "pending",
    "createdAt": "2025-11-10T10:00:00.000Z"
  }
}
```

#### 8. **Get Pending Requests**
```
GET http://localhost:8080/lease-request/pending

Headers:
Authorization: Bearer <token>

Expected Response:
[
  {
    "id": "req123",
    "companyEmail": "jane@company.com",
    "vehicleType": "SUV",
    "status": "pending",
    ...
  },
  ...
]
```

#### 9. **Approve Request**
```
POST http://localhost:8080/lease-request/approve/req123

Headers:
Authorization: Bearer <token>

Request Body:
{
  "vendorResponse": "Approved! We have perfect vehicles available."
}

Expected Response:
{
  "success": true,
  "message": "Request approved successfully"
}
```

#### 10. **Reject Request**
```
POST http://localhost:8080/lease-request/reject/req123

Headers:
Authorization: Bearer <token>

Request Body:
{
  "vendorResponse": "Sorry, no vehicles available at this time."
}

Expected Response:
{
  "success": true,
  "message": "Request rejected successfully"
}
```

### Vehicle Endpoints

#### 11. **Get Available Vehicles**
```
GET http://localhost:8080/vehicle/available

Headers:
Authorization: Bearer <token>

Expected Response:
[
  {
    "id": "v1",
    "vendorEmail": "john@vendor.com",
    "vendorCompany": "ABC Leasing",
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "type": "Sedan",
    "pricePerMonth": 450,
    "available": true,
    "features": ["Automatic", "GPS", "Bluetooth"]
  },
  ...
]
```

---

## 🔐 CORS Configuration

Your backend needs to allow requests from your Angular frontend.

### Spring Boot Example (Java)

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:4201")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

### Node.js/Express Example

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4201',
  credentials: true
}));
```

---

## 🧪 Testing the Integration

### 1. Start Your Backend
```bash
# Make sure your backend is running on port 8080
```

### 2. Start Angular Frontend
```bash
ng serve --port 4201
```

### 3. Test Registration

**Vendor Signup:**
1. Go to `http://localhost:4201/auth/signup-vendor`
2. Fill the form
3. Submit
4. Check browser console → Should see: `📝 Saving vendor via backend API: http://localhost:8080/vendor/register`
5. Check backend logs → Should receive POST request

**Company Signup:**
1. Go to `http://localhost:4201/auth/signup-company`
2. Fill the form
3. Submit
4. Check browser console → Should see: `📝 Saving company via backend API: http://localhost:8080/company/register`
5. Check backend logs → Should receive POST request

### 4. Test Login

1. Go to `http://localhost:4201/auth/login`
2. Enter credentials from signup
3. Submit
4. Check browser console → Should see: `🔐 Logging in via backend API: http://localhost:8080/user/login`
5. Should redirect to dashboard if successful

### 5. Monitor Network Tab

Press F12 → Network tab:
- ✅ All API calls should go to `http://localhost:8080`
- ✅ All requests should have `Authorization: Bearer <token>` header (after login)
- ✅ Check request/response payloads

---

## 🐛 Troubleshooting

### Issue: CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:** Add CORS configuration to your backend (see CORS section above)

### Issue: 401 Unauthorized
```
GET http://localhost:8080/... 401 (Unauthorized)
```

**Solution:**
1. Make sure you're logged in
2. Check if token is stored: `localStorage.getItem('authToken')`
3. Verify backend accepts the token format

### Issue: Cannot connect to backend
```
GET http://localhost:8080/... net::ERR_CONNECTION_REFUSED
```

**Solution:**
1. Make sure backend is running
2. Verify backend is on port 8080
3. Check if URL is correct in `api.config.ts`

### Issue: Want to test without backend

**Solution:** Set `USE_BACKEND_API = false` in all services:
- `auth.service.ts`
- `vendor-data.service.ts`
- `company-data.service.ts`
- `lease-request.service.ts`

---

## 📝 Customizing for Your Backend

### 1. Update Endpoint Paths

Edit `/src/app/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',  // Change if different
  
  AUTH: {
    LOGIN: '/your-login-endpoint',  // Update to match your API
    SIGNUP: '/your-signup-endpoint',
  },
  
  // ... update all other endpoints
}
```

### 2. Update Request/Response Format

If your backend expects different field names, update the services:

**Example in auth.service.ts:**
```typescript
// Change from
{ email, password }

// To match your backend
{ username: email, pwd: password }
```

### 3. Update Token Storage

If your backend sends token with different key:

**In auth.service.ts:**
```typescript
// Change from
if (response.token) {
  localStorage.setItem('authToken', response.token);
}

// To
if (response.accessToken) {
  localStorage.setItem('authToken', response.accessToken);
}
```

---

## 🎯 Next Steps

1. ✅ **Backend is Running** - Make sure it's on `http://localhost:8080`
2. ✅ **CORS Configured** - Allow requests from `http://localhost:4201`
3. ✅ **Test Registration** - Create a vendor and company user
4. ✅ **Test Login** - Login with those credentials
5. ✅ **Monitor Logs** - Check both frontend console and backend logs
6. ✅ **Verify Data** - Check if data is saved in your backend database

---

## 🔄 Switching Between Backend and LocalStorage

### Use Backend (Production Mode)
```typescript
// In each service
private USE_BACKEND_API = true;
```

### Use LocalStorage (Development/Testing Mode)
```typescript
// In each service
private USE_BACKEND_API = false;
```

This allows you to:
- ✅ Test frontend without backend
- ✅ Switch between modes easily
- ✅ Develop independently

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Verify all endpoints match your backend
4. Test endpoints with Postman/Thunder Client first
5. Ensure CORS is configured correctly

**Your backend integration is complete!** 🎉
