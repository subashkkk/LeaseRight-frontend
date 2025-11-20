import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestCredentialsService {
  
  /**
   * Initialize test credentials in localStorage
   * Call this method to set up local test users for development
   */
  initializeTestCredentials(): void {
    this.addTestVendor();
    this.addTestCompany();
    console.log('✅ Test credentials initialized successfully!');
    console.log('📋 You can now login with:');
    console.log('   Vendor: vendor@test.com / Test@123');
    console.log('   Company: company@test.com / Test@123');
    console.log('   Admin: admin@leaseright.com / Admin@123');
  }

  /**
   * Add a test vendor to localStorage
   */
  private addTestVendor(): void {
    const vendors = this.getStoredData('vendor_registrations');
    
    // Check if test vendor already exists
    const exists = vendors.some((v: any) => v.email === 'vendor@test.com');
    if (exists) {
      console.log('⚠️  Test vendor already exists');
      return;
    }

    const testVendor = {
      email: 'vendor@test.com',
      password: 'Test@123',
      firstName: 'Test',
      lastName: 'Vendor',
      companyName: 'Test Vendor Company',
      phoneNumber: '9876543210',
      gstNumber: 'TEST123456789',
      panNumber: 'TESTPAN123',
      address: '123 Test Street, Test City',
      serviceTypes: ['cars', 'bikes'],
      registrationDate: new Date().toISOString()
    };

    vendors.push(testVendor);
    localStorage.setItem('vendor_registrations', JSON.stringify(vendors));
    console.log('✅ Test vendor added:', testVendor.email);
  }

  /**
   * Add a test company to localStorage
   */
  private addTestCompany(): void {
    const companies = this.getStoredData('company_registrations');
    
    // Check if test company already exists
    const exists = companies.some((c: any) => c.email === 'company@test.com');
    if (exists) {
      console.log('⚠️  Test company already exists');
      return;
    }

    const testCompany = {
      email: 'company@test.com',
      password: 'Test@123',
      firstName: 'Test',
      lastName: 'Company',
      companyName: 'Test Company Ltd',
      phoneNumber: '9876543211',
      gstNumber: 'COMP123456789',
      panNumber: 'COMPPAN123',
      address: '456 Company Street, Business City',
      industry: 'Technology',
      employeeCount: '50-100',
      registrationDate: new Date().toISOString()
    };

    companies.push(testCompany);
    localStorage.setItem('company_registrations', JSON.stringify(companies));
    console.log('✅ Test company added:', testCompany.email);
  }

  /**
   * Get stored data from localStorage
   */
  private getStoredData(key: string): any[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return [];
    }
  }

  /**
   * Clear all test credentials
   */
  clearTestCredentials(): void {
    const vendors = this.getStoredData('vendor_registrations');
    const companies = this.getStoredData('company_registrations');

    // Remove test users
    const filteredVendors = vendors.filter((v: any) => v.email !== 'vendor@test.com');
    const filteredCompanies = companies.filter((c: any) => c.email !== 'company@test.com');

    localStorage.setItem('vendor_registrations', JSON.stringify(filteredVendors));
    localStorage.setItem('company_registrations', JSON.stringify(filteredCompanies));
    
    console.log('🗑️  Test credentials cleared');
  }

  /**
   * Display all registered users (for debugging)
   */
  listAllUsers(): void {
    const vendors = this.getStoredData('vendor_registrations');
    const companies = this.getStoredData('company_registrations');

    console.log('=== ALL REGISTERED USERS ===');
    console.log('\n📦 VENDORS:', vendors.length);
    vendors.forEach((v: any, i: number) => {
      console.log(`  ${i + 1}. ${v.email} (${v.companyName})`);
    });

    console.log('\n🏢 COMPANIES:', companies.length);
    companies.forEach((c: any, i: number) => {
      console.log(`  ${i + 1}. ${c.email} (${c.companyName})`);
    });

    console.log('\n👨‍💼 ADMIN:');
    console.log('  1. admin@leaseright.com');
  }

  /**
   * Add custom credentials
   */
  addCustomCredentials(
    type: 'vendor' | 'company',
    email: string,
    password: string,
    additionalData: any = {}
  ): void {
    const key = type === 'vendor' ? 'vendor_registrations' : 'company_registrations';
    const users = this.getStoredData(key);

    // Check if user already exists
    const exists = users.some((u: any) => u.email === email);
    if (exists) {
      console.warn(`⚠️  User with email ${email} already exists`);
      return;
    }

    const newUser = {
      email,
      password,
      firstName: additionalData.firstName || 'Custom',
      lastName: additionalData.lastName || 'User',
      companyName: additionalData.companyName || 'Custom Company',
      phoneNumber: additionalData.phoneNumber || '0000000000',
      registrationDate: new Date().toISOString(),
      ...additionalData
    };

    users.push(newUser);
    localStorage.setItem(key, JSON.stringify(users));
    console.log(`✅ Custom ${type} added:`, email);
  }
}
