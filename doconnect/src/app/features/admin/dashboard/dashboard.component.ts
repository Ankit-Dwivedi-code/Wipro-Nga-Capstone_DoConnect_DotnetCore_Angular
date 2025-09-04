// src/app/features/admin/dashboard.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/admin.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page">
      <h2>Pending Questions</h2>
      <mat-card *ngFor="let q of questions" class="q-card">
        <mat-card-title>{{ q.title }}</mat-card-title>
        <mat-card-content>{{ q.text | slice:0:150 }}</mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="approveQuestion(q.id)">Approve</button>
          <button mat-button color="warn" (click)="rejectQuestion(q.id)">Reject</button>
        </mat-card-actions>
      </mat-card>

      <h2 style="margin-top:2rem;">Pending Answers</h2>
      <mat-card *ngFor="let a of answers" class="q-card">
        <mat-card-title>Answer to: {{ a.questionTitle }}</mat-card-title>
        <mat-card-content>{{ a.text | slice:0:150 }}</mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="approveAnswer(a.id)">Approve</button>
          <button mat-button color="warn" (click)="rejectAnswer(a.id)">Reject</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`.page{padding:16px}.q-card{margin-bottom:12px}`]
})
export class DashboardComponent implements OnInit {
   questions: any[] = [];
  answers: any[] = [];

  constructor(@Inject(AdminService) private admin: AdminService, private snack: MatSnackBar, private router: Router) {}

  ngOnInit() {
    this.loadPending(); // guard already ensured admin
  }

  private handleAuthError(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) {
      // silent redirect; no popup
      this.router.navigate(['/questions']);
      return true;
    }
    return false;
  }

  loadPending() {
    this.admin.getPendingQuestions().subscribe({
      next: res => this.questions = res,
      error: e => { if (!this.handleAuthError(e)) console.error(e); }
    });
    this.admin.getPendingAnswers().subscribe({
      next: res => this.answers = res,
      error: e => { if (!this.handleAuthError(e)) console.error(e); }
    });
  }

  approveQuestion(id: string) {
    this.admin.approveQuestion(id).subscribe({
      next: () => {
        this.snack.open('Question Approved', 'ok', { duration: 2000 });
        this.questions = this.questions.filter(q => q.id !== id);
      },
      error: (e: HttpErrorResponse) => { if (!this.handleAuthError(e)) this.snack.open('Operation failed', 'ok', { duration: 1500 }); }
    });
  }
  rejectQuestion(id: string) {
    this.admin.rejectQuestion(id).subscribe({
      next: () => {
        this.snack.open('Question Rejected', 'ok', { duration: 2000 });
        this.questions = this.questions.filter(q => q.id !== id);
      },
      error: (e: HttpErrorResponse) => { if (!this.handleAuthError(e)) this.snack.open('Operation failed', 'ok', { duration: 1500 }); }
    });
  }

  approveAnswer(id: string) {
    this.admin.approveAnswer(id).subscribe({
      next: () => {
        this.snack.open('Answer Approved', 'ok', { duration: 2000 });
        this.answers = this.answers.filter(a => a.id !== id);
      },
      error: (e: HttpErrorResponse) => { if (!this.handleAuthError(e)) this.snack.open('Operation failed', 'ok', { duration: 1500 }); }
    });
  }
  rejectAnswer(id: string) {
    this.admin.rejectAnswer(id).subscribe({
      next: () => {
        this.snack.open('Answer Rejected', 'ok', { duration: 2000 });
        this.answers = this.answers.filter(a => a.id !== id);
      },
      error: (e: HttpErrorResponse) => { if (!this.handleAuthError(e)) this.snack.open('Operation failed', 'ok', { duration: 1500 }); }
    });
  }
}
