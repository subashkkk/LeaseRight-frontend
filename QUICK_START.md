# 🚀 Quick Start - Local Development with Test Credentials

## ✅ What's Been Set Up

Your LeaseRight application now has local test credentials ready to use! Here's what I've configured:

### 1. **Test Credentials Service** ✨
- Auto-creates test accounts when you visit the login page
- Provides vendor, company, and admin test accounts
- Stored in: `/src/app/services/test-credentials.service.ts`

### 2. **Dev Helper Functions** 🛠️
- Available in browser console as `DevHelpers`
- Quick commands to manage credentials, view users, check login status
- Stored in: `/src/app/dev-helpers.ts`

### 3. **Auto-Initialization** 🔄
- Test credentials automatically initialize when visiting `/auth/login`
- No manual setup required!

---

## 🔐 Ready-to-Use Credentials

### Quick Login Options:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@leaseright.com | Admin@123 | /admin/dashboard |
| **Vendor** | vendor@test.com | Test@123 | /home/vendor-dashboard |
| **Company** | company@test.com | Test@123 | /home/company-dashboard |

---

## 🎯 How to Get Started

### Step 1: Start Development Server
```bash
cd "/Users/preethis/Documents/untitled folder/LeaseRight"
ng serve
```

### Step 2: Open Application
Navigate to: `http://localhost:4200`

### Step 3: Login with Test Credentials
1. Go to `/auth/login` (if not already there)
2. Check browser console - you'll see test credentials initialized ✅
3. Use any of the credentials above to login
4. You'll be redirected to the appropriate dashboard based on role

### Step 4: Start Working on Dashboard Features
Now you can develop dashboard features without needing backend login integration!

---

## 🧰 Browser Console Commands

After opening your app, these commands are available in the browser console:

### View All Credentials
```javascript
DevHelpers.showCredentials()
```

### Check Current Login Status
```javascript
DevHelpers.checkStatus()
```

### List All Registered Users
```javascript
DevHelpers.listAllUsers()
```

### Logout Current User
```javascript
DevHelpers.clearSession()
// Then refresh the page
```

### View All Helper Commands
```javascript
DevHelpers.welcome()
```

---

## 💡 Common Tasks

### Task: Test Different User Roles

1. **Login as Vendor**:
   - Email: `vendor@test.com`
   - Password: `Test@123`
   - Redirects to: `/home/vendor-dashboard`

2. **Logout** (in console):
   ```javascript
   DevHelpers.clearSession()
   ```
   Then refresh the page

3. **Login as Company**:
   - Email: `company@test.com`
   - Password: `Test@123`
   - Redirects to: `/home/company-dashboard`

4. **Login as Admin**:
   - Email: `admin@leaseright.com`
   - Password: `Admin@123`
   - Redirects to: `/admin/dashboard`

### Task: Add Custom Test User

```javascript
// In browser console
testCredentialsService.addCustomCredentials(
  'vendor',  // or 'company'
  'custom@test.com',
  'MyPassword@123',
  {
    firstName: 'Custom',
    lastName: 'User',
    companyName: 'Custom Company',
    phoneNumber: '1234567890'
  }
)
```

### Task: View Registered Users
```javascript
// In browser console
DevHelpers.listAllUsers()
```

### Task: Clear All Data and Start Fresh
```javascript
// In browser console
DevHelpers.clearAll()  // Will ask for confirmation
// Then refresh the page
```

---

## 📁 Project Structure

```
/src/app/
├── services/
│   └── test-credentials.service.ts    # Test credential management
├── Auth/
│   ├── auth.service.ts                 # Authentication service (USE_BACKEND_API = false)
│   └── login/
│       ├── login.ts                    # Login component (auto-initializes test credentials)
│       └── login.html                  # Login form
├── dev-helpers.ts                      # Browser console helpers
└── app.ts                              # Main app (imports dev-helpers)
```

---

## 🔧 Configuration

### Current Auth Mode: **LocalStorage** (No Backend Required)

Located in: `/src/app/Auth/auth.service.ts`

```typescript
private USE_BACKEND_API = false; // ✅ Currently using LocalStorage
```

**To switch to backend API later:**
1. Set `USE_BACKEND_API = true`
2. Ensure backend is running
3. Verify API_CONFIG endpoints

---

## 🐛 Troubleshooting

### Problem: "Test credentials not showing"
**Solution:**
1. Open browser console
2. Check for initialization messages
3. Refresh the page
4. Manually run: `testCredentialsService.initializeTestCredentials()`

### Problem: "Login not working"
**Solution:**
1. Check console for errors
2. Verify `USE_BACKEND_API = false` in auth.service.ts
3. Check credentials with: `DevHelpers.listAllUsers()`
4. Clear localStorage: `DevHelpers.clearAll()` and refresh

### Problem: "Redirected to login after successful login"
**Solution:**
1. Check if auth token is set: `DevHelpers.checkStatus()`
2. Check browser console for errors
3. Verify localStorage has: `authToken`, `userRole`, `userName`

### Problem: "Can't access DevHelpers in console"
**Solution:**
1. Ensure app is running
2. Wait for app to fully load (check console for welcome message)
3. Type `DevHelpers` in console and press Enter
4. Should see the DevHelpers object

---

## 📚 Additional Resources

- **Full Credentials List**: See `LOCAL_CREDENTIALS.md`
- **API Configuration**: `/src/app/config/api.config.ts`
- **Auth Service**: `/src/app/Auth/auth.service.ts`
- **OTP Service**: `/src/app/services/otp.service.ts`

---

## ✨ Next Steps

Now that you have local login working:

1. ✅ **Test Dashboard Access**
   - Login with different roles
   - Verify each dashboard loads correctly

2. ✅ **Develop Dashboard Features**
   - Work on vendor dashboard features
   - Work on company dashboard features
   - Work on admin dashboard features

3. ✅ **Test User Flows**
   - Test navigation between pages
   - Test user-specific features
   - Test role-based access

4. 🔄 **Later: Integrate Backend Login**
   - When ready, set `USE_BACKEND_API = true`
   - Test with actual backend endpoints
   - Remove test credentials initialization from production

---

## 📝 Notes

- Test credentials are stored in browser localStorage
- Clearing browser data will remove test accounts
- Each browser/profile has separate test data
- Remember to remove test credential auto-initialization before production deployment

---

**Happy Coding! 🎉**

For any questions or issues, check the browser console for helpful debug messages!
