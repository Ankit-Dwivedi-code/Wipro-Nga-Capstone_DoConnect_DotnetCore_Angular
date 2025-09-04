// src/app/core/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    const user = this.auth.getUser();
    if (user?.role === 'Admin') return true;
    this.router.navigate(['/']);
    return false;
  }
}
