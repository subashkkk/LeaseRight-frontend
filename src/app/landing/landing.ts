import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  isSliding = false;

  constructor(private router: Router) {}

  onLoginClick(): void {
    // Start the slide animation
    this.isSliding = true;
    
    console.log('🚀 Starting navigation to /auth/login');
    
    // Clear any existing auth tokens (temporary fix for testing)
    // This ensures user can access login page even if old tokens exist
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    console.log('🧹 Cleared old auth tokens');
    
    // Navigate to login after animation completes
    setTimeout(() => {
      console.log('⏰ Timeout complete, attempting navigation');
      this.router.navigate(['/auth/login']).then(
        success => console.log('✅ Navigation success:', success),
        error => console.error('❌ Navigation error:', error)
      );
    }, 800);
  }
}
