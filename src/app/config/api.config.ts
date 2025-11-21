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
    RESEND: '/resend-otp'        // GET - Resend OTP to email
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
