import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import './dev-helpers'; // Load dev helpers for browser console

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('LeaseRight');
}
