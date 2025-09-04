// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule
  ],
  template: `
  <div class="center">
    <mat-card class="auth-card">
      <h2>Register</h2>
      <form [formGroup]="f" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full"><mat-label>Username</mat-label><input matInput formControlName="username" /></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Email</mat-label><input matInput formControlName="email" /></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Password</mat-label><input matInput type="password" formControlName="password" /></mat-form-field>
        <button mat-flat-button color="primary" [disabled]="f.invalid">Register</button>
        <button mat-button routerLink="/auth/login" type="button">Already have account?</button>
      </form>
    </mat-card>
  </div>
  `,
  styles: [`
    .center { display:flex; height:100vh; align-items:center; justify-content:center }
    .auth-card { width: 420px; padding: 20px }
    .full { width:100% }
  `]
})
export class RegisterComponent {
  f: ReturnType<FormBuilder['group']>;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snack: MatSnackBar) {
    this.f = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  submit() {
    if (this.f.invalid) return;
    const { username, email, password } = this.f.value;
    this.auth.register({
      username: username ?? '',
      email: email ?? '',
      password: password ?? ''
    }).subscribe({
      next: () => { this.snack.open('Registered', 'ok', { duration: 1200 }); this.router.navigate(['/questions']); },
      error: (e) => { console.error(e); this.snack.open(e?.error?.message || 'Register failed', 'ok'); }
    });
  }
}
