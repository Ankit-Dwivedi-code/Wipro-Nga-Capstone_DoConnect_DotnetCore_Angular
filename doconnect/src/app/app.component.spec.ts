import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component'; // adjust path if needed
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // or provideRouter([]) if you don’t have this
import { MockAuthService, commonImports, commonSchemas } from '../testing/mocks';
import { AuthService } from './core/auth.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, ...commonImports],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
      ],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand / title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent?.toLowerCase()).toContain('doconnect');
  });
});
