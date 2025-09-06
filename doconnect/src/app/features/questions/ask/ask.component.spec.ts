import { TestBed } from '@angular/core/testing';
import { AskComponent } from './ask.component'; // adjust path
import { MockQuestionService, commonImports, commonSchemas, provideMatSnackBarStub } from '../../../../testing/mocks';
import { QuestionService } from '../../../core/question.service';

describe('AskComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskComponent, ...commonImports],
      providers: [
        { provide: QuestionService, useClass: MockQuestionService },
        provideMatSnackBarStub
      ],
      schemas: [...commonSchemas]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AskComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
