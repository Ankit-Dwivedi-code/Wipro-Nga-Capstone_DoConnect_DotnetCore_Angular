// src/app/features/questions/ask/ask.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QuestionService } from '../../../core/question.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-ask',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
  <mat-card>
    <h2>Ask a Question</h2>
    <form [formGroup]="f" (ngSubmit)="submit()">
      <mat-form-field appearance="outline" class="full"><mat-label>Title</mat-label><input matInput formControlName="title" /></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>Body</mat-label><textarea matInput rows="6" formControlName="body"></textarea></mat-form-field>
      <input type="file" (change)="onFiles($event)" multiple />
      <div style="margin-top:12px">
        <button mat-flat-button color="primary" [disabled]="f.invalid">Post</button>
      </div>
    </form>
  </mat-card>
  `,
  styles: [`.full{width:100%}`]
})
export class AskComponent {
  f: ReturnType<FormBuilder['group']>;
  files: File[] = [];
  constructor(private fb: FormBuilder, private qs: QuestionService, private router: Router, private snack: MatSnackBar) {
    this.f = this.fb.group({ title: ['', Validators.required], body: ['', Validators.required] });
  }

  onFiles(e: Event) {
    const el = e.target as HTMLInputElement;
    if (!el.files) return;
    this.files = Array.from(el.files);
  }

  submit() {
    if (this.f.invalid) return;
    this.qs.createQuestion(this.f.value, this.files).subscribe({
      next: () => { this.snack.open('Question posted', 'ok', { duration: 1200 }); this.router.navigate(['/questions']); },
      error: e => { console.error(e); this.snack.open('Failed', 'ok'); }
    });
  }
}
