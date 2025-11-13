# API Troubleshooting Guide

## 🔍 Quick Diagnostics

### Step 1: Check Browser Console
Press **F12** → **Console** tab

Look for these messages:

#### ✅ Good Signs (API Working):
```
🔐 Logging in via backend API: http://localhost:8080/user/login
✅ Backend login successful: { token: "...", user: {...} }

📝 Saving vendor via backend API: http://localhost:8080/vendor/register
✅ Vendor saved to backend: { success: true, ... }

📝 Creating lease request via backend API: http://localhost:8080/lease-request/create
✅ Lease request created via backend: { success: true, ... }
```

#### ❌ Problem Signs:
```
❌ Backend login failed: { error: "..." }
❌ Backend vendor save failed: { error: "..." }
❌ CORS error
❌ 401 Unauthorized
❌ 404 Not Found
❌ 500 Internal Server Error
```

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Error

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:8080/...' from origin 
'http://localhost:4201' has been blocked by CORS policy
```

**What it means:** Your backend is not allowing requests from your Angular frontend.

**Solutions:**

#### For Spring Boot Backend:
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
                        .exposedHeaders("Authorization")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
```

#### For Node.js/Express Backend:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:4201',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Issue 2: Backend Not Running

**Error Message:**
```
GET http://localhost:8080/... net::ERR_CONNECTION_REFUSED
```

**What it means:** Your backend server is not running or not on port 8080.

**Solutions:**

1. **Start your backend:**
   ```bash
   # Spring Boot
   mvn spring-boot:run
   # or
   ./gradlew bootRun
   
   # Node.js
   npm start
   # or
   node server.js
   ```

2. **Verify backend is running:**
   - Open browser: `http://localhost:8080`
   - Should see something (not connection refused)

3. **Check port:**
   - Is your backend on port 8080?
   - If different, update `/src/app/config/api.config.ts`:
     ```typescript
     BASE_URL: 'http://localhost:YOUR_PORT'
     ```

---

### Issue 3: 404 Not Found

**Error Message:**
```
POST http://localhost:8080/user/login 404 (Not Found)
```

**What it means:** The endpoint path doesn't exist on your backend.

**Solutions:**

1. **Check your backend routes:**
   - Is `/user/login` the correct endpoint?
   - Or is it `/api/auth/login`?
   - Or `/api/user/login`?

2. **Update frontend to match backend:**
   
   Edit `/src/app/config/api.config.ts`:
   ```typescript
   AUTH: {
     LOGIN: '/api/auth/login',      // Change to match your backend
     SIGNUP: '/api/auth/register',  // Change to match your backend
   }
   ```

3. **Test endpoint with Postman/Thunder Client:**
   ```
   POST http://localhost:8080/user/login
   Body: { "email": "test@test.com", "password": "test123" }
   ```

---

### Issue 4: 401 Unauthorized

**Error Message:**
```
GET http://localhost:8080/vendor/all 401 (Unauthorized)
```

**What it means:** Token is missing or invalid.

**Solutions:**

1. **Check if user is logged in:**
   ```javascript
   // In browser console:
   localStorage.getItem('authToken')
   // Should show a token, not null
   ```

2. **Check Authorization header:**
   - F12 → Network tab
   - Click on failed request
   - Headers → Request Headers
   - Should see: `Authorization: Bearer <token>`

3. **Verify backend accepts this token format:**
   - Does your backend expect `Bearer <token>`?
   - Or just `<token>`?
   
   If different, update `/src/app/interceptors/auth.interceptor.ts`:
   ```typescript
   authReq = req.clone({
     setHeaders: {
       Authorization: token  // Without "Bearer"
       // or
       'x-auth-token': token // Custom header
     }
   });
   ```

---

### Issue 5: 500 Internal Server Error

**Error Message:**
```
POST http://localhost:8080/vendor/register 500 (Internal Server Error)
```

**What it means:** Your backend code has an error.

**Solutions:**

1. **Check backend logs/console:**
   - Look for stack traces
   - Look for error messages

2. **Common backend issues:**
   - Database connection failed
   - Missing fields in request body
   - Validation errors
   - Null pointer exceptions

3. **Test with Postman:**
   - Send same request via Postman
   - See full error response
   - Fix backend code

---

### Issue 6: Request Payload Mismatch

**Error:** Backend says "Missing required field"

**What it means:** Frontend is sending different field names than backend expects.

**Solutions:**

1. **Check what frontend sends:**
   - F12 → Network tab → Click request → Payload
   - See actual JSON being sent

2. **Check what backend expects:**
   - Look at backend controller/model
   - Compare field names

3. **Example mismatch:**
   
   **Frontend sends:**
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@test.com"
   }
   ```
   
   **Backend expects:**
   ```json
   {
     "first_name": "John",  // Snake case!
     "last_name": "Doe",
     "email": "john@test.com"
   }
   ```
   
   **Solution:** Update frontend service to match:
   ```typescript
   const payload = {
     first_name: userData.firstName,
     last_name: userData.lastName,
     email: userData.email
   };
   this.http.post(url, payload);
   ```

---

### Issue 7: Response Format Mismatch

**Error:** Frontend crashes after successful backend call

**What it means:** Backend response structure is different than frontend expects.

**Solutions:**

1. **Check backend response:**
   - F12 → Network → Response tab
   - See what backend actually returns

2. **Update frontend to handle it:**
   
   **If backend returns:**
   ```json
   {
     "data": {
       "token": "abc123",
       "user": {...}
     }
   }
   ```
   
   **Update auth.service.ts:**
   ```typescript
   map((response: any) => {
     // Access nested data
     if (response.data.token) {
       localStorage.setItem('authToken', response.data.token);
     }
     return response.data; // Return nested object
   })
   ```

---

## 🧪 Testing Steps

### Test Backend Endpoints Directly

Use Postman, Thunder Client, or curl:

```bash
# Test Login
curl -X POST http://localhost:8080/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Test Register
curl -X POST http://localhost:8080/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@vendor.com",
    "companyName":"ABC Leasing",
    "password":"password123",
    "role":"vendor"
  }'

# Test with Token
curl -X GET http://localhost:8080/vendor/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

If these work ✅ → Backend is fine, check frontend
If these fail ❌ → Fix backend first

---

## 🔧 Quick Fixes

### Disable Backend Temporarily

If you want to test frontend without backend:

**Set `USE_BACKEND_API = false` in all services:**

1. `/src/app/Auth/auth.service.ts` line 13
2. `/src/app/services/vendor-data.service.ts` line 21
3. `/src/app/services/company-data.service.ts` line 21
4. `/src/app/services/lease-request.service.ts` line 41

This switches to LocalStorage mode for testing.

---

## 📊 Debug Checklist

Before asking for help, verify:

- [ ] Backend is running on `http://localhost:8080`
- [ ] CORS is configured on backend
- [ ] Endpoint paths match between frontend and backend
- [ ] Request payload format matches backend expectations
- [ ] Response format matches frontend expectations
- [ ] Token is being sent in Authorization header
- [ ] No errors in backend console/logs
- [ ] Tested endpoints with Postman/curl successfully

---

## 🔍 Enable Verbose Logging

Add this to see all HTTP requests:

In `auth.interceptor.ts`:
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🌐 HTTP Request:', req.method, req.url);
  console.log('📤 Request Headers:', req.headers);
  console.log('📦 Request Body:', req.body);
  
  // ... existing code ...
  
  return next(authReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        console.log('✅ HTTP Response:', event.status, event.body);
      }
    }),
    catchError((error) => {
      console.log('❌ HTTP Error:', error);
      // ... existing error handling ...
    })
  );
};
```

---

## 📞 Still Having Issues?

1. **Share these details:**
   - Browser console errors (screenshot)
   - Network tab showing failed request
   - Backend logs/errors
   - Your backend endpoint paths
   - Request/response payloads

2. **Common causes in order of frequency:**
   1. CORS not configured (50%)
   2. Backend not running (20%)
   3. Wrong endpoint paths (15%)
   4. Payload format mismatch (10%)
   5. Other (5%)

**Most issues are CORS-related. Configure CORS first!**
