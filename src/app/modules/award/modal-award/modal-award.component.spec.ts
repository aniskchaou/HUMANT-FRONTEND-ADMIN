import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAwardComponent } from './modal-award.component';

describe('ModalAwardComponent', () => {
  let component: ModalAwardComponent;
  let fixture: ComponentFixture<ModalAwardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAwardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAwardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
