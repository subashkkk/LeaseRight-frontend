/**
 * API Configuration
 * Central place to manage all backend API endpoints
 */

export const API_CONFIG = {
  // Base URL
  BASE_URL: 'http://localhost:8080',
  
  // Auth Endpoints
  AUTH: {
    LOGIN: '/users/login',
    SIGNUP: '/users/addNewUser',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    VERIFY_TOKEN: '/users/verify-token'
  },

  // OTP Endpoints - User Registration with OTP
  OTP: {
    SIGNUP: '/signup',           // POST - Create user, validate GST, send OTP
    VERIFY: '/verify_OTP',       // POST - Verify OTP and activate account
    RESEND: '/resend-otp',       // GET - Resend OTP to email
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password'
  },
  
  // User Profile Endpoints
  USER: {
    GET_PROFILE: '/users/getUserById/:id',      // GET - Get user by ID
    UPDATE_PROFILE: '/users/updateUserById/:id', // PUT - Update user by ID
    CHANGE_PASSWORD: '/users/change-password',
    GET_CURRENT_USER: '/users/me'               // GET - Get current authenticated user
  },

  // Vendor Endpoints
  VENDOR: {
    REGISTER: '/vendor/register',
    GET_ALL: '/vendor/all',
    GET_BY_ID: '/vendor/:id',
    UPDATE: '/vendor/update/:id',
    DELETE: '/vendor/delete/:id',
    GET_VEHICLES: '/vendor/:id/vehicles',
    GET_REQUESTS: '/vendor/requests'
  },
  
  // Company Endpoints
  COMPANY: {
    REGISTER: '/company/register',
    GET_ALL: '/company/all',
    GET_BY_ID: '/company/:id',
    UPDATE: '/company/update/:id',
    DELETE: '/company/delete/:id',
    GET_REQUESTS: '/company/:id/requests'
  },
  
  // Vehicle Endpoints
  VEHICLE: {
    CREATE: '/vehicle/create',
    GET_ALL: '/vehicle/all',
    GET_BY_ID: '/vehicle/:id',
    UPDATE: '/vehicle/update/:id',
    DELETE: '/vehicle/delete/:id',
    GET_AVAILABLE: '/vehicle/available',
    SEARCH: '/vehicle/search'
  },
  
  // Lease Request Endpoints (matching backend controller)
  LEASE_REQUEST: {
    CREATE: '/lease-requests/new-Lease-Request',      // POST - Create new lease request
    UPDATE: '/lease-requests/:id',                    // PUT - Update existing lease request
    GET_ALL: '/lease-requests/all',                   // GET - Get all requests (for vendors)
    GET_BY_ID: '/lease-requests/:id',                 // GET - Get single request by ID
    GET_BY_COMPANY: '/lease-requests/company/:companyId'  // GET - Get requests by company ID
  },

  // Admin Endpoints
  ADMIN: {
    GET_ALL_USERS: '/allUsers',                       // GET - Get all users
    GET_USER_BY_ID: '/getbyid/:id',                   // GET - Get user by ID
    UPDATE_USER: '/updatebyid/:id',                   // PUT - Update user by ID
    DELETE_USER: '/deletebyid/:id',                   // DELETE - Delete user by ID
    GET_USER_BY_NAME: '/getbyname/:name',            // GET - Get user by name
    DELETE_USER_BY_NAME: '/deletebyname/:name',      // DELETE - Delete user by name
    GET_USERS_BY_ROLE: '/users/role/:role',          // GET - Get users filtered by role (will use findByRole)
    TOTAL_ACTIVE_USERS: '/TotalActiveUsers',         // GET - Total active users
    TOTAL_ACTIVE_VENDORS: '/TotalActiveVendors',     // GET - Total active vendors
    TOTAL_ACTIVE_COMPANIES: '/TotalActiveCompanies'  // GET - Total active companies
  }
};

/**
 * Helper function to build full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Replace URL parameters
 * Example: replaceUrlParams('/user/:id', { id: '123' }) => '/user/123'
 */
export function replaceUrlParams(url: string, params: { [key: string]: string | number }): string {
  let result = url;
  Object.keys(params).forEach(key => {
    result = result.replace(`:${key}`, String(params[key]));
  });
  return result;
}
