// src/app/core/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AnswerDto, QuestionDto } from './question.service';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ---- Moderation ----
  approveQuestion(id: string) { return this.http.post(`${this.api}/questions/${id}/approve`, {}); }
  rejectQuestion(id: string)  { return this.http.post(`${this.api}/questions/${id}/reject`, {}); }
  approveAnswer(id: string)   { return this.http.post(`${this.api}/answers/${id}/approve`, {}); }
  rejectAnswer(id: string)    { return this.http.post(`${this.api}/answers/${id}/reject`, {}); }

  getPendingQuestions() {
    return this.http.get<any[]>(`${this.api}/questions/pending`)
      .pipe(catchError(() => of([]))); 
  }
  getPendingAnswers() {
    return this.http.get<any[]>(`${this.api}/answers/pending`)
      .pipe(catchError(() => of([])));
  }

  // ---- Admin create QUESTION (auto-approved) ----
  createQuestionForm(formData: FormData) {
    return this.http.post<QuestionDto>(`${this.api}/questions`, formData);
  }
  createQuestionFromFields(title: string, text: string, files?: File[]) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Text', text);
    files?.forEach(f => fd.append('Files', f, f.name));
    return this.createQuestionForm(fd);
  }

  // ---- Admin create ANSWER (auto-approved) ----
  postAnswerForm(questionId: string, formData: FormData) {
    return this.http.post<AnswerDto>(`${this.api}/questions/${questionId}/answers`, formData);
  }
  postAnswerFromFields(questionId: string, text: string, files?: File[]) {
    const fd = new FormData();
    fd.append('Text', text);
    files?.forEach(f => fd.append('Files', f, f.name));
    return this.postAnswerForm(questionId, fd);
  }

  // admin check ----
  checkAdmin() {
    
    if (!this.auth.getToken()) {
      return of(false);
    }

    return this.http.get<{ role?: string }>(`${environment.apiUrl}/auth/me`).pipe(
      map(me => me?.role === 'Admin'),
      catchError(() => of(false)) 
    );
  }

  // ---- Delete ----
  deleteQuestion(id: string) {
    return this.http.delete(`${this.api}/questions/${id}`);
  }
}
