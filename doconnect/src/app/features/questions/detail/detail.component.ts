// src/app/features/questions/detail/detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from '../../../core/question.service';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-question-detail',
  imports: [CommonModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <mat-card *ngIf="q">
      <h2>{{ q.title }}</h2>
      <p>{{ q.body }}</p>
      <small>By {{ q.createdBy?.name || 'Anon' }}</small>
    </mat-card>

    <mat-card *ngIf="answers">
      <h3>Answers</h3>
      <div *ngFor="let a of answers" class="answer">
        <p>{{ a.body }}</p>
        <small>By {{ a.createdBy?.name || 'Anon' }}</small>
      </div>
    </mat-card>

    <mat-card>
      <form [formGroup]="f" (ngSubmit)="post()">
        <mat-form-field class="full"><mat-label>Your answer</mat-label><textarea matInput rows="4" formControlName="body"></textarea></mat-form-field>
        <button mat-flat-button color="primary" [disabled]="f.invalid">Post answer</button>
      </form>
    </mat-card>
  `,
  styles: [`.full{width:100%} .answer{padding:8px 0;border-bottom:1px solid #eee}`]
})
export class DetailComponent implements OnInit {
  q: any = null;
  answers: any[] = [];
  f: any;

  constructor(private route: ActivatedRoute, private qs: QuestionService, private fb: FormBuilder, private snack: MatSnackBar) {
    this.f = this.fb.group({ body: ['', Validators.required] });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.qs.getQuestion(id).subscribe(q => this.q = q);
    this.qs.getAnswers(id).subscribe(a => this.answers = a);
  }

  post() {
    if (this.f.invalid) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.qs.postAnswer(id, { body: this.f.value.body }).subscribe({
      next: ans => { this.answers.unshift(ans); this.f.reset(); this.snack.open('Answer posted', 'ok', { duration: 1200 }); },
      error: e => { console.error(e); this.snack.open('Failed', 'ok'); }
    });
  }
}
