import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenceComponent } from './presence.component';

describe('PresenceComponent', () => {
  let component: PresenceComponent;
  let fixture: ComponentFixture<PresenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
