import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupVendor } from './signup-vendor';

const routes: Routes = [
  {
    path: '',
    component: SignupVendor
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SignupVendor,
    RouterModule.forChild(routes)
  ]
})
export class SignupVendorModule { }
