import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  // ✓ ADD THIS
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Feature routing module
import { AuthRoutingModule } from './auth-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,  // ✓ REQUIRED FOR *ngFor, *ngIf, etc.
    ReactiveFormsModule,
    FormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
