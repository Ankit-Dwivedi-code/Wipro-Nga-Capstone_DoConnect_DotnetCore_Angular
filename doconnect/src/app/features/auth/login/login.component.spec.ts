import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component'; // adjust path
import { MockAuthService, commonImports, commonSchemas, provideMatSnackBarStub} from '../../../../testing/mocks';
import { AuthService } from '../../../core/auth.service';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ...commonImports],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        provideMatSnackBarStub
      ],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
