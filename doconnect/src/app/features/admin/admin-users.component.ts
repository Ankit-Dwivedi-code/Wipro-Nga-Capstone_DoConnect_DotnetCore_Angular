import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { AdminUsersService, RoleType, UserSummary } from './admin-users.service';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  private svc = inject(AdminUsersService);
  private fb = inject(FormBuilder);

  users = signal<UserSummary[]>([]);
  loading = signal<boolean>(true);
  search = signal<string>('');
  editingId = signal<string | null>(null);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  addForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['User', [Validators.required]]
  });

  editForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['User', [Validators.required]],
    newPassword: ['']
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.search()).subscribe({
      next: (u) => { this.users.set(u); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message || 'Failed to load users'); this.loading.set(false); }
    });
  }

  startEdit(u: UserSummary) {
    this.editingId.set(u.id);
    this.editForm.patchValue({ username: u.username, email: u.email, role: u.role, newPassword: '' });
  }
  cancelEdit() { this.editingId.set(null); }

  create() {
    if (this.addForm.invalid) return;
    const formValue = this.addForm.getRawValue();
    // Ensure role is of type RoleType
    this.svc.create({ ...formValue, role: formValue.role as RoleType }).subscribe({
      next: (u) => { this.success.set('User created'); this.addForm.reset({ role: 'User' }); this.load(); },
      error: (e) => this.error.set(e.error?.message || 'Create failed')
    });
  }

  save() {
    const id = this.editingId();
    if (!id || this.editForm.invalid) return;
    const payload = this.editForm.getRawValue();
    if (!payload.newPassword) (payload as any).newPassword = null;
    // Ensure role is of type RoleType
    this.svc.update(id, { ...payload, role: payload.role as RoleType }).subscribe({
      next: () => { this.success.set('User updated'); this.editingId.set(null); this.load(); },
      error: (e) => this.error.set(e.error?.message || 'Update failed')
    });
  }

  remove(id: string) {
    if (!confirm('Delete this user?')) return;
    this.svc.delete(id).subscribe({
      next: () => { this.success.set('User deleted'); this.load(); },
      error: (e) => this.error.set(e.error?.message || 'Delete failed')
    });
  }
}
