import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Signupfront } from './signupfront';

const routes: Routes = [
  {
    path: '',
    component: Signupfront
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Signupfront,
    RouterModule.forChild(routes)
  ]
})
export class SignupfrontModule { }
