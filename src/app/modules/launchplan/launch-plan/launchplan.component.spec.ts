import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchplanComponent } from './launchplan.component';

describe('LaunchplanComponent', () => {
  let component: LaunchplanComponent;
  let fixture: ComponentFixture<LaunchplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchplanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
