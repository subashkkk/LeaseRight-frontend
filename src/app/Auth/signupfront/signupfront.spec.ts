import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signupfront } from './signupfront';

describe('Signupfront', () => {
  let component: Signupfront;
  let fixture: ComponentFixture<Signupfront>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signupfront]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signupfront);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
