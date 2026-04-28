import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { NavigationComponent } from './navigation.component';
import { AccessControlService } from 'src/app/main/security/access-control.service';

class RouterStub {
  url = '/dashboard';
  readonly events = new Subject<any>();
}

class AccessControlServiceStub {
  canAccessRoute(): boolean {
    return true;
  }
}

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let router: RouterStub;

  beforeEach(async () => {
    router = new RouterStub();

    await TestBed.configureTestingModule({
      declarations: [NavigationComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: AccessControlService, useClass: AccessControlServiceStub },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle section visibility when section header is clicked', () => {
    const section = component.visibleSections[0];
    const clickEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
    } as any as Event;

    expect(component.isSectionOpen(section)).toBeFalse();

    component.toggleSection(section, clickEvent);
    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(component.isSectionOpen(section)).toBeTrue();

    component.toggleSection(section, clickEvent);
    expect(component.isSectionOpen(section)).toBeFalse();
  });

  it('should expand the section for the active route after navigation', () => {
    const settingsSection = component.visibleSections.find(
      (section) => section.label === 'Settings'
    );

    expect(settingsSection).toBeTruthy();
    expect(component.isSectionOpen(settingsSection!)).toBeFalse();

    router.url = '/configuration';
    router.events.next(new NavigationEnd(1, '/configuration', '/configuration'));

    expect(component.isSectionOpen(settingsSection!)).toBeTrue();
  });
});
