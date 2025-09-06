import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component'; // adjust path
import { MockAuthService, commonImports, commonSchemas, provideMatSnackBarStub } from '../../..//../testing/mocks';
import { AuthService } from '../../../core/auth.service';

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ...commonImports],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        provideMatSnackBarStub
      ],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
