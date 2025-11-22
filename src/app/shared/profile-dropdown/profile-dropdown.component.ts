import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ProfileMenuItem {
  icon: string;
  label: string;
  action: string;
  badge?: number;
}

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-dropdown.component.html',
  styleUrls: ['./profile-dropdown.component.css']
})
export class ProfileDropdownComponent {
  @Input() userName: string = '';
  @Input() userRole: string = '';
  @Input() menuItems: ProfileMenuItem[] = [];
  @Output() menuItemClick = new EventEmitter<string>();
  @Output() logoutClick = new EventEmitter<void>();

  isOpen: boolean = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  onMenuItemClick(action: string): void {
    this.menuItemClick.emit(action);
    this.closeDropdown();
  }

  onLogout(): void {
    this.logoutClick.emit();
    this.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.profile-dropdown');
    if (!clickedInside && this.isOpen) {
      this.closeDropdown();
    }
  }
}
