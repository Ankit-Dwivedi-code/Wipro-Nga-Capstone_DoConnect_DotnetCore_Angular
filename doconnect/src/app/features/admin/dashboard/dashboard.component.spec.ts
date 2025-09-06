import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component'; // adjust path
import { MockAdminService, commonImports, commonSchemas } from '../../../../testing/mocks';
import { AdminService } from '../../../core/admin.service';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, ...commonImports],
      providers: [{ provide: AdminService, useClass: MockAdminService }],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
