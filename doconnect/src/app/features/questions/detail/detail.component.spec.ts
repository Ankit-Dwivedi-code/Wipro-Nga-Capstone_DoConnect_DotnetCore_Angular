import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import { QuestionService } from '../../../core/question.service';

import {
  MockQuestionService,
  commonImports,
  commonSchemas,
  provideActivatedRoute
} from '../../../../testing/mocks';

describe('DetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailComponent, ...commonImports],
      providers: [
        { provide: QuestionService, useClass: MockQuestionService },
        provideActivatedRoute({ id: 'q1' })
      ],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DetailComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
