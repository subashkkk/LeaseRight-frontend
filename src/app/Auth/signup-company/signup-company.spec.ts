import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupCompany } from './signup-company';

describe('SignupCompany', () => {
  let component: SignupCompany;
  let fixture: ComponentFixture<SignupCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
