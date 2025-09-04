// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: 'questions', loadChildren: () => import('./features/questions/questions.routes').then(m => m.QUESTIONS_ROUTES) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: '', redirectTo: 'questions', pathMatch: 'full' },
  { path: '**', redirectTo: 'questions' }
];
