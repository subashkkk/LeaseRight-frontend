import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupFrontComponent } from './signupfront';

describe('Signupfront', () => {
  let component: SignupFrontComponent;
  let fixture: ComponentFixture<SignupFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupFrontComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
