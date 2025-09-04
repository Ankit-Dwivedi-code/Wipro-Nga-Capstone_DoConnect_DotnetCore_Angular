import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { QuestionService } from '../../../core/question.service';
import { debounceTime } from 'rxjs';

@Component({
  // ...
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatInputModule, ReactiveFormsModule, MatListModule, MatPaginatorModule
  ],
  // ...
  template: `
    <div class="page">
      <div class="toolbar">
        <input matInput placeholder="Search questions..." [formControl]="search" />
        <button mat-flat-button color="primary" routerLink="/questions/ask">Ask Question</button>
      </div>

      <mat-card *ngFor="let q of questions" class="q-card">
        <mat-card-title>{{ q.title }}</mat-card-title>
        <mat-card-content>
          <p>{{ q.body | slice:0:200 }}...</p>
          <small>By {{ q.createdBy?.name || 'Anonymous' }} • {{ q.createdAt | date }}</small>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button [routerLink]="['/questions', q.id]">View</button>
        </mat-card-actions>
      </mat-card>

      <mat-paginator [length]="total" [pageSize]="pageSize"
                     [pageSizeOptions]="[5, 10, 20]"
                     (page)="onPage($event)">
      </mat-paginator>
    </div>
  `
})
export class ListComponent implements OnInit {
  search = new FormControl('');
  questions: any[] = [];
  total = 0;
  page = 1;
  pageSize = 5;

  constructor(private qs: QuestionService) {}

  ngOnInit() {
    this.load();
    this.search.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => { this.page = 1; this.load(); });
  }

  load() {
    this.qs.getQuestions(this.search.value || '', this.page, this.pageSize).subscribe((res: any) => {
      this.questions = res.items || res;
      this.total = res.total || this.questions.length;
    });
  }

  onPage(e: PageEvent) {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }
}
