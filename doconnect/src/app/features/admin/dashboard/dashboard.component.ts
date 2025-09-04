// src/app/features/admin/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/admin.service';
import { QuestionService } from '../../../core/question.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page">
      <h2>Pending Questions</h2>
      <mat-card *ngFor="let q of questions" class="q-card">
        <mat-card-title>{{ q.title }}</mat-card-title>
        <mat-card-content>{{ q.body | slice:0:150 }}</mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="approve(q.id)">Approve</button>
          <button mat-button color="warn" (click)="reject(q.id)">Reject</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`.page{padding:16px}.q-card{margin-bottom:12px}`]
})
export class DashboardComponent implements OnInit {
  questions: any[] = [];
  constructor(private admin: AdminService, private qs: QuestionService, private snack: MatSnackBar) {}

  ngOnInit() { this.qs.getQuestions('',1,100).subscribe((res:any) => this.questions = res.items || res); }

  approve(id:number) {
    this.admin.approveQuestion(id).subscribe(() => { this.snack.open('Approved', 'ok'); this.questions = this.questions.filter(q => q.id !== id); });
  }
  reject(id:number) {
    this.admin.rejectQuestion(id).subscribe(() => { this.snack.open('Rejected', 'ok'); this.questions = this.questions.filter(q => q.id !== id); });
  }
}
