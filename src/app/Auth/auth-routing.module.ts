import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'signup-frontpage',
    loadChildren: () => import('./signupfront/signupfront.module').then(m => m.SignupfrontModule)
  },
  {
    path: 'signup-vendor',
    loadChildren: () => import('./signup-vendor/signup-vendor.module').then(m => m.SignupVendorModule)
  },
  {
    path: 'signup-company',
    loadChildren: () => import('./signup-company/signup-company.module').then(m => m.SignupCompanyModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
