import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../../../core/question.service';
import { AdminService } from '../../../core/admin.service';
import { AuthService } from '../../../core/auth.service';
import { debounceTime, firstValueFrom } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../../environments/environment'; // <— add this

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatInputModule, ReactiveFormsModule, MatListModule,
    MatPaginatorModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  search = new FormControl('');
  questions: any[] = [];
  total = 0;
  page = 1;
  pageSize = 5;
  isAdmin = false;

  constructor(
    private qs: QuestionService,
    private admin: AdminService,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  async ngOnInit() {
    this.isAdmin = this.checkIsAdminLocal();
    try {
      const ok = await firstValueFrom(this.admin.checkAdmin());
      if (ok) this.isAdmin = true;
    } catch { /* ignore */ }

    this.load();
    this.search.valueChanges.pipe(debounceTime(300))
      .subscribe(() => { this.page = 1; this.load(); });
  }

  load() {
    this.qs.getQuestions(this.search.value || '', this.page, this.pageSize)
      .subscribe((res: any) => {
        this.questions = res.items || [];
        this.total = res.total ?? this.questions.length;
      });
  }

  asUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const rel = path.startsWith('/') ? path : `/${path}`;
    // public URL is http://localhost:5108/uploads/..., no 'wwwroot' in URL
    return `${environment.apiOrigin}${rel}`;
  }

  onPage(e: PageEvent) { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
  onSearchClick() { this.page = 1; this.load(); }

  onDelete(id: string, title: string) {
  // If somehow clicked before admin flag settles, just ignore.
  if (!this.isAdmin) return;

  const ok = confirm(`Delete this question?\n\n${title}`);
  if (!ok) return;

  this.admin.deleteQuestion(id).subscribe({
    next: () => {
      this.questions = this.questions.filter(q => q.id !== id);
      this.total = Math.max(0, this.total - 1);
      this.snack.open('Question deleted', 'ok', { duration: 1500 });
    },
    error: (err: HttpErrorResponse) => {
      // Silently handle auth errors (no popup for normal users)
      if (err.status === 401 || err.status === 403) {
        this.isAdmin = false; // hide any admin-only UI moving forward
        return;
      }
      console.error(err);
      // Keep a generic failure toast for real errors (network, 5xx, etc.)
      this.snack.open('Failed to delete question', 'ok', { duration: 2000 });
    }
  });
}

  private checkIsAdminLocal(): boolean {
    try {
      const token = (this.auth as any).currentToken?.() ?? (this.auth as any).currentToken;
      if (!token) return false;
      const payload: any = jwtDecode(token);
      let roleClaim =
        payload?.role ??
        payload?.roles ??
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      if (typeof roleClaim === 'string' && roleClaim.trim().startsWith('[')) {
        try { roleClaim = JSON.parse(roleClaim); } catch { /* ignore */ }
      }
      const roles: string[] = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
      return roles.map(r => String(r).toLowerCase()).includes('admin');
    } catch { return false; }
  }
}
