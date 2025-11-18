import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./Auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./Home/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'home/vendor-dashboard',
    loadComponent: () => import('./Home/vendor-dashboard/vendor-dashboard').then(m => m.VendorDashboard)
  },
  {
    path: 'home/company-dashboard',
    loadComponent: () => import('./Home/company-dashboard/company-dashboard').then(m => m.CompanyDashboard)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
