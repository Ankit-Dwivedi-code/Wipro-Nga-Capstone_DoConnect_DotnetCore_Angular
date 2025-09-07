import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

type MeClaims = { id?: string; username?: string; email?: string; role?: string };

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  auth = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  ok = signal<string | null>(null);
  err = signal<string | null>(null);
  showPw = signal(false);

  /** Latest claims from server (merged with local if server misses something like email). */
  me = signal<MeClaims>({});

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    currentPassword: [''],
    newPassword: ['']
  });

  ngOnInit(): void {
    // Paint from local (fast)
    const u: any = this.auth.getUser();
    if (u) {
      this.me.set({
        id: String(u.id ?? u.Id ?? ''),
        username: u.username ?? u.Username ?? '',
        email: u.email ?? u.Email ?? '',
        role: u.role ?? u.Role ?? ''
      });
      this.form.patchValue({
        username: this.me().username || '',
        email: this.me().email || ''
      });
    }

    // Fetch fresh claims (authorised)
    this.fetchMe();

    // If newPassword is entered, require currentPassword
    this.form.controls.newPassword.valueChanges.subscribe(v => {
      const cp = this.form.controls.currentPassword;
      if (v && v.trim().length > 0) {
        cp.addValidators([Validators.required, Validators.minLength(1)]);
      } else {
        cp.clearValidators();
      }
      cp.updateValueAndValidity({ emitEvent: false });
    });
  }

  private fetchMe() {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<MeClaims>(`${environment.apiUrl}/Auth/me`, { headers }).subscribe({
      next: (serverMe) => {
        // Merge: prefer serverMe but keep local fallbacks (email is commonly missing in tokens)
        const local: any = this.auth.getUser() || {};
        const merged: MeClaims = {
          id: serverMe?.id ?? String(local.id ?? local.Id ?? ''),
          username: serverMe?.username ?? local.username ?? local.Username ?? '',
          email: serverMe?.email ?? local.email ?? local.Email ?? '',
          role: serverMe?.role ?? local.role ?? local.Role ?? ''
        };
        this.me.set(merged);
        this.form.patchValue({ username: merged.username || '', email: merged.email || '' });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  /** Best-effort email (server / local, any casing) */
  currentEmail(): string {
    const m = this.me();
    if (m?.email) return m.email;
    const u: any = this.auth.getUser();
    return u?.email ?? u?.Email ?? '';
  }

  initials(): string {
    const name = (this.me().username || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = (parts[1]?.[0] ?? '') || (parts.length === 1 ? (parts[0]?.[1] ?? '') : '');
    return (a + b).toUpperCase();
  }

  submit(allFields = false) {
    // If called from the pw section, we still submit the same payload; allFields flag not required,
    // but we keep the arg to be explicit from template.
    if (this.form.invalid) return;
    this.saving.set(true);
    this.ok.set(null);
    this.err.set(null);

    const v = this.form.getRawValue();
    const payload = {
      username: v.username.trim(),
      email: v.email.trim(),
      currentPassword: v.currentPassword?.trim() ? v.currentPassword : null,
      newPassword: v.newPassword?.trim() ? v.newPassword : null
    };

    this.auth.updateMyProfile(payload).subscribe({
      next: () => {
        this.ok.set(payload.newPassword ? 'Password and profile updated.' : 'Profile updated.');
        this.err.set(null);
        this.saving.set(false);

        // Refresh local cache and header info
        this.fetchMe();
      },
      error: (e) => {
        this.err.set(e?.error?.message || 'Update failed');
        this.ok.set(null);
        this.saving.set(false);
      }
    });
  }
}
