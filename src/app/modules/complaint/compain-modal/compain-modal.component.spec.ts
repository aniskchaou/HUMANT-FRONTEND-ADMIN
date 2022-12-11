import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompainModalComponent } from './compain-modal.component';

describe('CompainModalComponent', () => {
  let component: CompainModalComponent;
  let fixture: ComponentFixture<CompainModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompainModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
