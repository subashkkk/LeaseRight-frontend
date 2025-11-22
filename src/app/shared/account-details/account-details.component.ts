import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css']
})
export class AccountDetailsComponent implements OnInit {
  @Input() userRole: 'company' | 'vendor' | 'admin' = 'company';
  
  accountForm!: FormGroup;
  isEditing: boolean = false;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  userData: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    // Initialize form with localStorage data first
    this.initializeForm();
    // Then fetch fresh data from backend and reinitialize
    this.fetchUserProfileFromDB();
  }

  loadUserData(): void {
    this.userData = this.authService.getUser();
    console.log('📦 User data loaded from localStorage:', this.userData);
    console.log('📦 Phone:', this.userData?.phone || this.userData?.phoneNumber);
    console.log('📦 GST:', this.userData?.gstNumber);
    console.log('📦 Company:', this.userData?.companyName);
  }

  fetchUserProfileFromDB(): void {
    console.log('🔄 Fetching profile from backend...');
    // Fetch fresh data from backend API
    this.authService.getProfile().subscribe({
      next: (profile) => {
        console.log('✅ Profile fetched from backend:', profile);
        console.log('✅ All backend fields:', Object.keys(profile));
        
        // Map backend field names to our expected field names
        const mappedProfile = {
          ...profile,
          // Map contactNo to phone
          phone: profile?.contactNo,
          // Map name to companyName
          companyName: profile?.name,
          // Map gstNo to gstNumber
          gstNumber: profile?.gstNo,
          // Map panNo to panNumber
          panNumber: profile?.panNo,
          // Map mail to email
          email: profile?.mail
        };
        
        console.log('✅ Backend contactNo:', profile?.contactNo);
        console.log('✅ Backend name:', profile?.name);
        console.log('✅ Backend gstNo:', profile?.gstNo);
        console.log('✅ Backend panNo:', profile?.panNo);
        console.log('✅ Backend mail:', profile?.mail);
        console.log('🔄 Mapped profile:', mappedProfile);
        console.log('🔄 Final GST value:', mappedProfile.gstNumber);
        console.log('🔄 Final PAN value:', mappedProfile.panNumber);
        
        // Update local userData with mapped backend data
        this.userData = { ...this.userData, ...mappedProfile };
        
        console.log('🔄 Merged userData:', this.userData);
        
        // Reinitialize form with fresh data from backend
        this.initializeForm();
        
        console.log('✅ Form reinitialized with backend data');
        console.log('📝 Form values:', this.accountForm.getRawValue());
      },
      error: (error) => {
        console.error('❌ Error fetching profile from backend:', error);
        console.error('❌ Error details:', error?.error || error?.message);
        // Continue with localStorage data as fallback
        console.log('⚠️ Using localStorage data as fallback');
      }
    });
  }

  initializeForm(): void {
    console.log('🔧 Initializing form with userData:', this.userData);
    
    // Extract phone number (try multiple field names including backend's contactNo)
    const phoneValue = this.userData?.phone || this.userData?.contactNo || this.userData?.phoneNumber || '';
    console.log('📞 Phone value for form:', phoneValue);
    
    // Common fields for all user types (email)
    const emailValue = this.userData?.email || this.userData?.mail || '';
    const emailField = {
      email: [emailValue, [Validators.required, Validators.email]]
    };

    // Role-specific fields
    if (this.userRole === 'company' || this.userRole === 'vendor') {
      // Extract company name (backend uses 'name', we use 'companyName')
      const companyNameValue = this.userData?.companyName || this.userData?.name || '';
      // Backend uses 'gstNo'
      const gstValue = this.userData?.gstNumber || this.userData?.gstNo || '';
      // Backend uses 'panNo'
      const panValue = this.userData?.panNumber || this.userData?.panNo || '';
      
      console.log('🏢 Company name for form:', companyNameValue);
      console.log('📞 Phone number for form:', phoneValue);
      console.log('🔢 GST number for form:', gstValue);
      console.log('🆔 PAN number for form:', panValue);
      console.log('🔍 Raw userData:', this.userData);
      
      this.accountForm = this.fb.group({
        ...emailField,
        phone: [phoneValue, Validators.required],
        companyName: [companyNameValue, Validators.required],
        gstNumber: [gstValue, Validators.required],
        panNumber: [panValue]  // Optional field
      });
      
      console.log('✅ Form created for', this.userRole);
    } else {
      // Admin - only email and phone
      this.accountForm = this.fb.group({
        ...emailField,
        phone: [phoneValue, Validators.required]
      });
      console.log('✅ Form created for admin');
    }
    
    console.log('📝 Final form values:', this.accountForm.getRawValue());
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
    
    if (!this.isEditing) {
      // Reset form to original values
      this.initializeForm();
    }
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const formValues = this.accountForm.getRawValue();
    
    // Map frontend field names to backend field names
    // Only send editable fields: name, email, phone
    const backendData = {
      id: this.userData?.id,
      // Map phone to contactNo for backend
      contactNo: formValues.phone,
      // Map companyName to name for backend
      name: formValues.companyName,
      // Map email
      mail: formValues.email,
      // Don't send GST and PAN - they are read-only
      role: this.userData?.role
    };
    
    console.log('📤 Sending to backend (editable fields only):', backendData);

    // Update user data via backend API
    this.authService.updateProfile(backendData).subscribe({
      next: (response) => {
        console.log('✅ Profile updated:', response);
        
        // Update localStorage with mapped data (keep both frontend and backend field names)
        // GST and PAN remain unchanged
        const updatedData = {
          ...this.userData,
          phone: formValues.phone,
          contactNo: formValues.phone,
          companyName: formValues.companyName,
          name: formValues.companyName,
          email: formValues.email,
          mail: formValues.email
          // gstNumber and panNumber remain from userData (unchanged)
        };
        
        localStorage.setItem('user', JSON.stringify(updatedData));
        this.authService.setUser(updatedData);
        
        this.isSaving = false;
        this.successMessage = 'Account details updated successfully!';
        this.isEditing = false;
        this.userData = updatedData;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error updating profile:', error);
        this.isSaving = false;
        this.errorMessage = error?.error?.message || 'Failed to update account details. Please try again.';
      }
    });
  }

  cancelEdit(): void {
    this.toggleEdit();
  }
}
