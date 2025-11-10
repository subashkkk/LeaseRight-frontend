import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  isSliding = false;

  constructor(private router: Router) {}

  onLoginClick(): void {
    // Start the slide animation
    this.isSliding = true;
    
    // Navigate to login after animation completes
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 800);
  }
}
