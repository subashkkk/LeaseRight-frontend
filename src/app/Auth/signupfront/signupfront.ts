import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SignupOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
  isHovered: boolean;
  route: string;
}

@Component({
  selector: 'app-signupfront',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signupfront.html',
  styleUrls: ['./signupfront.css']
})
export class SignupFrontComponent implements OnInit {
  signupOptions: SignupOption[] = [];
  activeTab: string = '';
  showAnimation = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeSignupOptions();
    setTimeout(() => {
      this.showAnimation = true;
    }, 100);
  }

  initializeSignupOptions(): void {
    this.signupOptions = [
      {
        id: 'vendor',
        title: 'Sign Up as a Vendor',
        subtitle: 'Lease out your vehicles to companies',
        description: 'Join our platform to list your vehicles and connect with companies seeking reliable vehicle leasing partners',
        features: [
          '✓ Connect with 500+ companies nationwide',
          '✓ Manage your fleet with ease',
          '✓ Receive instant payment notifications',
          '✓ Get AI-powered recommendations to boost visibility'
        ],
        icon: '🚗',
        color: 'vendor',
        isHovered: false,
        route: '/auth/signup-vendor'
      },
      {
        id: 'company',
        title: 'Sign Up as a Company',
        subtitle: 'Lease vehicles for your employees',
        description: 'Find and lease the perfect vehicles for your team with our AI-powered vendor matching system',
        features: [
          '✓ Browse 2000+ vehicles from verified vendors',
          '✓ Smart AI-powered vendor matching',
          '✓ Fast and streamlined approval process',
          '✓ Flexible lease terms tailored to your needs'
        ],
        icon: '🏢',
        color: 'company',
        isHovered: false,
        route: '/auth/signup-company'
      }
    ];
  }

  onMouseEnter(optionId: string): void {
    const option = this.signupOptions.find(o => o.id === optionId);
    if (option) {
      option.isHovered = true;
    }
  }

  onMouseLeave(optionId: string): void {
    const option = this.signupOptions.find(o => o.id === optionId);
    if (option) {
      option.isHovered = false;
    }
  }

  handleSignupClick(optionId: string): void {
    const option = this.signupOptions.find(o => o.id === optionId);
    if (option) {
      this.router.navigate([option.route]);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
