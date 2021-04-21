import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutMenuComponent } from './shortcut-menu.component';

describe('ShortcutMenuComponent', () => {
  let component: ShortcutMenuComponent;
  let fixture: ComponentFixture<ShortcutMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShortcutMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortcutMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
