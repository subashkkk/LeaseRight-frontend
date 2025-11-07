import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Login } from './login';

const routes: Routes = [
  {
    path: '',
    component: Login
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Login,
    RouterModule.forChild(routes)
  ]
})
export class LoginModule { }
