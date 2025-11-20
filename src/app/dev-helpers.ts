/**
 * Development Helper Functions
 * These functions are available in the browser console during development
 */

export class DevHelpers {
  
  /**
   * Display all available test credentials
   */
  static showCredentials(): void {
    console.log('%c🔐 AVAILABLE TEST CREDENTIALS', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('');
    
    console.log('%c👨‍💼 ADMIN', 'color: #2196F3; font-weight: bold;');
    console.log('  Email: admin@leaseright.com');
    console.log('  Password: Admin@123');
    console.log('  Dashboard: /admin/dashboard');
    console.log('');
    
    console.log('%c📦 VENDOR', 'color: #FF9800; font-weight: bold;');
    console.log('  Email: vendor@test.com');
    console.log('  Password: Test@123');
    console.log('  Dashboard: /home/vendor-dashboard');
    console.log('');
    
    console.log('%c🏢 COMPANY', 'color: #9C27B0; font-weight: bold;');
    console.log('  Email: company@test.com');
    console.log('  Password: Test@123');
    console.log('  Dashboard: /home/company-dashboard');
    console.log('');
    
    console.log('%c📋 Quick Commands:', 'color: #607D8B; font-weight: bold;');
    console.log('  • DevHelpers.showCredentials() - Show this list');
    console.log('  • DevHelpers.listAllUsers() - List all registered users');
    console.log('  • DevHelpers.clearSession() - Logout current user');
    console.log('  • DevHelpers.clearAll() - Clear all data and test users');
  }

  /**
   * List all registered users from localStorage
   */
  static listAllUsers(): void {
    const vendors = JSON.parse(localStorage.getItem('vendor_registrations') || '[]');
    const companies = JSON.parse(localStorage.getItem('company_registrations') || '[]');
    
    console.log('%c📊 ALL REGISTERED USERS', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('');
    
    console.log('%c📦 VENDORS (' + vendors.length + ')', 'color: #FF9800; font-weight: bold;');
    if (vendors.length === 0) {
      console.log('  No vendors registered');
    } else {
      vendors.forEach((v: any, i: number) => {
        console.log(`  ${i + 1}. ${v.email} (${v.companyName})`);
      });
    }
    console.log('');
    
    console.log('%c🏢 COMPANIES (' + companies.length + ')', 'color: #9C27B0; font-weight: bold;');
    if (companies.length === 0) {
      console.log('  No companies registered');
    } else {
      companies.forEach((c: any, i: number) => {
        console.log(`  ${i + 1}. ${c.email} (${c.companyName})`);
      });
    }
    console.log('');
    
    console.log('%c👨‍💼 ADMIN (1)', 'color: #2196F3; font-weight: bold;');
    console.log('  1. admin@leaseright.com (LeaseRight Admin)');
  }

  /**
   * Check current login status
   */
  static checkStatus(): void {
    const isAuthenticated = !!localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');
    
    console.log('%c🔍 CURRENT SESSION STATUS', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('');
    console.log('Authenticated:', isAuthenticated);
    console.log('User Role:', userRole || 'N/A');
    console.log('User Name:', userName || 'N/A');
    
    if (isAuthenticated) {
      console.log('');
      console.log('%c✅ You are logged in!', 'color: #4CAF50; font-weight: bold;');
    } else {
      console.log('');
      console.log('%c⚠️  You are not logged in', 'color: #FF9800; font-weight: bold;');
    }
  }

  /**
   * Clear current session (logout)
   */
  static clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    console.log('%c🚪 Session cleared! Please refresh the page.', 'color: #4CAF50; font-weight: bold;');
  }

  /**
   * Clear all localStorage data including test users
   */
  static clearAll(): void {
    const confirmed = confirm('⚠️  This will clear ALL localStorage data including test users. Continue?');
    if (confirmed) {
      localStorage.clear();
      console.log('%c🗑️  All data cleared! Please refresh the page.', 'color: #F44336; font-weight: bold;');
    }
  }

  /**
   * Quick login helper (for console use)
   */
  static quickLogin(role: 'admin' | 'vendor' | 'company'): void {
    const credentials = {
      admin: { email: 'admin@leaseright.com', password: 'Admin@123' },
      vendor: { email: 'vendor@test.com', password: 'Test@123' },
      company: { email: 'company@test.com', password: 'Test@123' }
    };

    const cred = credentials[role];
    console.log(`%c🚀 Quick Login as ${role.toUpperCase()}`, 'color: #2196F3; font-weight: bold;');
    console.log(`Email: ${cred.email}`);
    console.log(`Password: ${cred.password}`);
    console.log('');
    console.log('Copy the credentials above and login manually, or use the auto-fill feature.');
  }

  /**
   * View localStorage data
   */
  static viewStorage(): void {
    console.log('%c💾 LOCALSTORAGE DATA', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log('');
    
    const keys = Object.keys(localStorage);
    if (keys.length === 0) {
      console.log('LocalStorage is empty');
      return;
    }

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value || '');
        console.log(`%c${key}:`, 'color: #2196F3; font-weight: bold;', parsed);
      } catch {
        console.log(`%c${key}:`, 'color: #2196F3; font-weight: bold;', value);
      }
    });
  }

  /**
   * Export test data (for backup)
   */
  static exportData(): void {
    const data = {
      vendors: JSON.parse(localStorage.getItem('vendor_registrations') || '[]'),
      companies: JSON.parse(localStorage.getItem('company_registrations') || '[]'),
      timestamp: new Date().toISOString()
    };
    
    console.log('%c📦 EXPORTED DATA', 'color: #4CAF50; font-size: 16px; font-weight: bold;');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log('Copy the above JSON to backup your test data');
  }

  /**
   * Display welcome message
   */
  static welcome(): void {
    console.log('%c🎉 Welcome to LeaseRight Development!', 'color: #4CAF50; font-size: 20px; font-weight: bold;');
    console.log('');
    console.log('%cAvailable Commands:', 'color: #2196F3; font-size: 14px; font-weight: bold;');
    console.log('  DevHelpers.showCredentials() - Show all test credentials');
    console.log('  DevHelpers.listAllUsers() - List all registered users');
    console.log('  DevHelpers.checkStatus() - Check current login status');
    console.log('  DevHelpers.clearSession() - Logout current user');
    console.log('  DevHelpers.clearAll() - Clear all data');
    console.log('  DevHelpers.quickLogin("admin"|"vendor"|"company") - Quick login helper');
    console.log('  DevHelpers.viewStorage() - View all localStorage data');
    console.log('  DevHelpers.exportData() - Export test data');
    console.log('');
    console.log('%cFor quick access to credentials, run:', 'color: #FF9800;');
    console.log('%cDevHelpers.showCredentials()', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
  }
}

// Make DevHelpers available globally in development
if (typeof window !== 'undefined') {
  (window as any).DevHelpers = DevHelpers;
  
  // Show welcome message
  setTimeout(() => {
    DevHelpers.welcome();
  }, 1000);
}
