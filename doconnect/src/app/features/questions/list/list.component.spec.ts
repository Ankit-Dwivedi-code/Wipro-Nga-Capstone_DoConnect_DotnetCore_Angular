import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListComponent } from './list.component';
import { QuestionService } from '../../../core/question.service';

import { MockQuestionService, commonImports, commonSchemas } from '../../../../testing/mocks';

describe('ListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent, ...commonImports],
      providers: [{ provide: QuestionService, useClass: MockQuestionService }],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
  
});
