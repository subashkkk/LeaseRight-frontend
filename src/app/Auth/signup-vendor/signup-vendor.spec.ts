import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupVendor } from './signup-vendor';

describe('SignupVendor', () => {
  let component: SignupVendor;
  let fixture: ComponentFixture<SignupVendor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupVendor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupVendor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
