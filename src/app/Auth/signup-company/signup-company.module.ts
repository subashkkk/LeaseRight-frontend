import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SignupCompany } from './signup-company';

const routes: Routes = [
  {
    path: '',
    component: SignupCompany
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SignupCompany,
    RouterModule.forChild(routes)
  ]
})
export class SignupCompanyModule { }
