import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminUsersService, UserSummary } from './admin-users.service';

class MockAdminUsersService {
  list = jasmine.createSpy('list');
  create = jasmine.createSpy('create');
  update = jasmine.createSpy('update');
  delete = jasmine.createSpy('delete');
}

function setInput(fixture: any, selector: string, value: string) {
  const el: HTMLInputElement = fixture.debugElement.query(By.css(selector))?.nativeElement;
  expect(el).withContext(`Missing input ${selector}`).toBeTruthy();
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

describe('AdminUsersComponent', () => {
  let fixture: any;
  let component: AdminUsersComponent;
  let svc: MockAdminUsersService;

  const users: UserSummary[] = [
    { id: crypto.randomUUID(), username: 'alice', email: 'alice@test.local', role: 'Admin', createdAt: new Date().toISOString() },
    { id: crypto.randomUUID(), username: 'bob',   email: 'bob@test.local',   role: 'User',  createdAt: new Date().toISOString() },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [{ provide: AdminUsersService, useClass: MockAdminUsersService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    svc = TestBed.inject(AdminUsersService) as any;

    // initial load
    (svc.list as jasmine.Spy).and.returnValue(of(users));
    fixture.detectChanges(); // triggers ngOnInit -> load()
  });

  it('should render initial users list', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('alice');
    expect(fixture.nativeElement.textContent).toContain('bob');
  });

  it('should validate add form and call create()', () => {
    // Invalid initially
    expect(component.addForm.valid).toBeFalse();

    // Fill form
    setInput(fixture, 'form.grid-form input[formControlName="username"]', 'charlie');
    setInput(fixture, 'form.grid-form input[formControlName="email"]', 'charlie@test.local');
    setInput(fixture, 'form.grid-form input[formControlName="password"]', 'Passw0rd!');
    const role = fixture.debugElement.query(By.css('form.grid-form select[formControlName="role"]')).nativeElement as HTMLSelectElement;
    role.value = 'Admin';
    role.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.addForm.valid).toBeTrue();

    // Service responses: create then reload list
    (svc.create as jasmine.Spy).and.returnValue(of({
      id: crypto.randomUUID(), username: 'charlie', email: 'charlie@test.local', role: 'Admin'
    } as UserSummary));

    (svc.list as jasmine.Spy).and.returnValue(of([
      ...users,
      { id: crypto.randomUUID(), username: 'charlie', email: 'charlie@test.local', role: 'Admin' }
    ]));

    // Submit form
    const createBtn: HTMLButtonElement = fixture.debugElement.query(By.css('.add button[type="submit"]')).nativeElement;
    expect(createBtn.disabled).toBeFalse();
    createBtn.click();

    fixture.detectChanges();

    expect(svc.create).toHaveBeenCalledTimes(1);
    const body = (svc.create as jasmine.Spy).calls.mostRecent().args[0];
    expect(body).toEqual(jasmine.objectContaining({
      username: 'charlie', email: 'charlie@test.local', role: 'Admin'
    }));

    // list() called again after create
    expect(svc.list).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('charlie');
  });

  it('should enter edit mode and call update()', () => {
    // Click "Edit" on first row
    const editBtn: HTMLButtonElement = fixture.debugElement.queryAll(By.css('tbody .right .btn'))[0].nativeElement;
    editBtn.click();
    fixture.detectChanges();

    // Change email + role
    setInput(fixture, 'tbody input[type="email"]', 'alice+new@test.local');
    const role = fixture.debugElement.query(By.css('tbody select')).nativeElement as HTMLSelectElement;
    role.value = 'User';
    role.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    (svc.update as jasmine.Spy).and.returnValue(of(void 0));
    (svc.list as jasmine.Spy).and.returnValue(of([
      { ...users[0], email: 'alice+new@test.local', role: 'User' },
      users[1]
    ]));

    // Save
    const saveBtn: HTMLButtonElement = fixture.debugElement.query(By.css('tbody .right .btn.btn-primary')).nativeElement;
    saveBtn.click();
    fixture.detectChanges();

    expect(svc.update).toHaveBeenCalledTimes(1);
    const [id, payload] = (svc.update as jasmine.Spy).calls.mostRecent().args;
    expect(id).toBe(users[0].id);
    expect(payload).toEqual(jasmine.objectContaining({ email: 'alice+new@test.local', role: 'User' }));
  });

  it('should confirm and call delete()', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    (svc.delete as jasmine.Spy).and.returnValue(of(void 0));
    (svc.list as jasmine.Spy).and.returnValue(of([users[1]]));

    // "Delete" is the second button in actions for the first row
    const buttons = fixture.debugElement.queryAll(By.css('tbody .right .btn'));
    const deleteBtn: HTMLButtonElement = buttons[1].nativeElement;
    deleteBtn.click();
    fixture.detectChanges();

    expect(window.confirm).toHaveBeenCalled();
    expect(svc.delete).toHaveBeenCalledTimes(1);
    expect(svc.delete).toHaveBeenCalledWith(users[0].id);
  });
});
