// src/app/core/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { QuestionDto } from './models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = `${environment.apiUrl}/admin`;
  constructor(private http: HttpClient) {}

  approveQuestion(id: number) { return this.http.post(`${this.api}/questions/${id}/approve`, {}); }
  rejectQuestion(id: number) { return this.http.post(`${this.api}/questions/${id}/reject`, {}); }
  // optionally: get pending questions
  getPendingQuestions() { return this.http.get<QuestionDto[]>(`${environment.apiUrl}/Questions?status=pending`); }
}
