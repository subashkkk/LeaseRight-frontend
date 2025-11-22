import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EyeTrackingService {
  private isInitialized = false;

  constructor() {}

  /**
   * Initialize eye tracking functionality for password fields
   * Call this in ngOnInit of components with password fields
   */
  initEyeTracking(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    document.addEventListener('mousemove', (e: MouseEvent) => {
      // Track both .password-toggle and .toggle-password buttons
      const eyeIcons = document.querySelectorAll('.password-toggle i.fa-eye, .toggle-password i.fa-eye');
      
      eyeIcons.forEach((icon: Element) => {
        const button = icon.closest('.password-toggle, .toggle-password') as HTMLElement;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate angle from eye to mouse
        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;

        // Limit movement range (iris stays within eye bounds)
        const maxMove = 3; // pixels
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const limitedDistance = Math.min(distance, 100);

        const moveX = (deltaX / distance) * Math.min(maxMove, limitedDistance / 30);
        const moveY = (deltaY / distance) * Math.min(maxMove, limitedDistance / 30);

        // Apply transform to make iris follow mouse
        (icon as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });
  }
}
