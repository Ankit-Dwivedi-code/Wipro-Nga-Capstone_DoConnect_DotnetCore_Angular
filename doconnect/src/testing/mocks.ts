import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

/* ===== Sample data ===== */
function sampleQuestions() {
  const now = new Date().toISOString();
  return [
    {
      id: 'q1',
      title: 'First Question',
      body: 'Body goes here',
      createdAt: now,
      user: { username: 'alice' },
      answers: []
    }
  ];
}

/* ===== Auth mock ===== */
@Injectable()
export class MockAuthService {
  private _user = { id: 'u1', username: 'admin', role: 'Admin', email: 'admin@x.com' };
  isLoggedIn() { return true; }
  getUser() { return this._user; }
  setUser(u: any) { this._user = u; }
  login(_c: any) { return of({ token: 'fake.jwt.token' }); }
  register(_c: any) { return of({ id: 'u2' }); }
  logout() {}
}

/* ===== Admin mock ===== */
@Injectable()
export class MockAdminService {
  list(_q?: string) { return of([]); }
  create(_u: any) { return of({ id: 'new' }); }
  update(_id: string, _u: any) { return of({}); }
  delete(_id: string) { return of({}); }
}

/* ===== Questions mock (supports multiple method names) ===== */
@Injectable()
export class MockQuestionService {
  // Your list page might call any of these:
  list(_term?: string) {
    return of(sampleQuestions());
  }
  getQuestions(_term?: string) {
    return of(sampleQuestions());
  }
  search(_term: string) {
    return of(sampleQuestions());
  }

  // Detail page might call any of these:
  get(id: string) {
    const q = sampleQuestions().find(x => x.id === id) ?? sampleQuestions()[0];
    return of(q);
  }
  getQuestion(id: string) {
    const q = sampleQuestions().find(x => x.id === id) ?? sampleQuestions()[0];
    return of(q);
  }
}

/* ===== ActivatedRoute stub factory ===== */
export function provideActivatedRoute(params: Record<string, string> = {}) {
  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap: convertToParamMap(params) },
      paramMap: of(convertToParamMap(params))
    }
  };
}

/* ===== SnackBar stub ===== */
export const provideMatSnackBarStub = {
  provide: MatSnackBar,
  useValue: { open: (_m?: string) => {} }
};

/* ===== Common test config helpers ===== */
export const commonImports = [HttpClientTestingModule, RouterTestingModule];
export const commonSchemas = [NO_ERRORS_SCHEMA];
