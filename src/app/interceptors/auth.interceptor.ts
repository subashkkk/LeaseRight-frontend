import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * HTTP Interceptor to add authentication token to requests
 * and handle authentication errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Get token from localStorage
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  // Clone the request and add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.error('❌ Unauthorized - redirecting to login');
        localStorage.clear();
        router.navigate(['/auth/login']);
      }
      
      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('❌ Forbidden - insufficient permissions');
      }
      
      // Handle 500 Server errors
      if (error.status === 500) {
        console.error('❌ Server error - please try again later');
      }
      
      return throwError(() => error);
    })
  );
};
