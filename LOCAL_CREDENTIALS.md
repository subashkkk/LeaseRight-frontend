# Local Development Credentials

This document contains all the credentials you can use for local testing before integrating the backend login API.

## 🔐 Available Test Accounts

### Admin Account
```
Email: admin@leaseright.com
Password: Admin@123
Role: Admin
Dashboard: /admin/dashboard
```

### Test Vendor Account
```
Email: vendor@test.com
Password: Test@123
Role: Vendor
Dashboard: /home/vendor-dashboard
```

### Test Company Account
```
Email: company@test.com
Password: Test@123
Role: Company
Dashboard: /home/company-dashboard
```

## 🚀 How to Use

### Automatic Setup
The test credentials are automatically initialized when you navigate to the login page. Check the browser console for confirmation messages.

### Manual Setup (Browser Console)
If you want to manually manage credentials, open the browser console and use:

```javascript
// List all registered users
testCredentialsService.listAllUsers();

// Add custom vendor
testCredentialsService.addCustomCredentials('vendor', 'myvendor@test.com', 'MyPass@123', {
  firstName: 'John',
  lastName: 'Doe',
  companyName: 'John Vehicles',
  phoneNumber: '1234567890'
});

// Add custom company
testCredentialsService.addCustomCredentials('company', 'mycompany@test.com', 'MyPass@123', {
  firstName: 'Jane',
  lastName: 'Smith',
  companyName: 'Smith Corp',
  phoneNumber: '0987654321',
  industry: 'Manufacturing'
});

// Clear test credentials
testCredentialsService.clearTestCredentials();
```

## 📝 Using Previously Registered Accounts

If you've already tested the signup flow, those credentials are stored in localStorage:
- Check Vendor registrations: `vendor_registrations`
- Check Company registrations: `company_registrations`

To view them:
```javascript
// In browser console
JSON.parse(localStorage.getItem('vendor_registrations'))
JSON.parse(localStorage.getItem('company_registrations'))
```

## 🔄 Switching Between Local & Backend API

The authentication is currently using local storage. To switch to backend API:

1. Open: `/src/app/Auth/auth.service.ts`
2. Change: `USE_BACKEND_API = false` to `USE_BACKEND_API = true`
3. Ensure your backend API is running and API_CONFIG is properly set

## 🗑️ Clearing Login Session

To logout and clear the current session:
```javascript
// In browser console
localStorage.clear();
// Or just remove auth tokens
localStorage.removeItem('authToken');
localStorage.removeItem('userRole');
localStorage.removeItem('userName');
```

## 📍 Dashboard Routes

After successful login, you'll be redirected based on your role:
- **Admin**: `/admin/dashboard`
- **Vendor**: `/home/vendor-dashboard`
- **Company**: `/home/company-dashboard`

## 🛠️ Development Workflow

1. **Start Development**: Run `ng serve`
2. **Navigate to Login**: Go to `/auth/login`
3. **Login with Test Account**: Use any of the credentials above
4. **Access Dashboard**: You'll be automatically redirected
5. **Develop Features**: Work on dashboard features without backend integration
6. **Logout**: Use logout button or clear localStorage
7. **Repeat**: Login again as needed

## ⚠️ Important Notes

- Test credentials are stored in browser's localStorage
- Clearing browser data will remove all test accounts
- Each browser/profile will have separate test data
- These credentials are for local development only
- Remember to implement proper backend authentication before production

## 🔍 Debugging

If you encounter login issues:

1. Check browser console for error messages
2. Verify credentials in localStorage:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('vendor_registrations')));
   console.log(JSON.parse(localStorage.getItem('company_registrations')));
   ```
3. Ensure `USE_BACKEND_API` is set to `false` in `auth.service.ts`
4. Clear localStorage and refresh the page to reinitialize test credentials

## 💡 Tips

- Use **Remember Me** checkbox to save email for quick login
- Admin account is hardcoded and always available
- You can create multiple test accounts with different roles
- Test different user roles to ensure dashboard features work for all types
