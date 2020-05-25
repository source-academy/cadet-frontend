import {
  AssessmentCategory,
  AutogradingResult,
  GradingStatus,
  MCQChoice,
  Question,
  Testcase
} from 'src/commons/assessment/AssessmentTypes';
import { Notification } from 'src/components/notification/notificationShape';

/**
 * Information on a Grading, for a particular student submission
 * for a particular assessment. Used for display in the UI.
 */
export type GradingOverview = {
  assessmentId: number;
  assessmentName: string;
  assessmentCategory: AssessmentCategory;
  initialGrade: number;
  gradeAdjustment: number;
  currentGrade: number;
  maxGrade: number;
  initialXp: number;
  xpBonus: number;
  xpAdjustment: number;
  currentXp: number;
  maxXp: number;
  studentId: number;
  studentName: string;
  submissionId: number;
  submissionStatus: string;
  groupName: string;
  gradingStatus: GradingStatus;
  questionCount: number;
  gradedCount: number;
};

export type GradingOverviewWithNotifications = {
  notifications: Notification[];
} & GradingOverview;

/**
 * The information fetched before
 * grading a submission.
 */
export type Grading = GradingQuestion[];

/**
 * Encapsulates information regarding grading a
 * particular question in a submission.
 */
export type GradingQuestion = {
  question: AnsweredQuestion;
  student: {
    name: string;
    id: number;
  };
  grade: {
    roomId: string;
    grade: number;
    gradeAdjustment: number;
    xp: number;
    xpAdjustment: number;
    comments?: string;
    grader?: {
      name: string;
      id: number;
    };
    gradedAt?: string;
  };
};

/**
 * A Question to be shown when a trainer is
 * grading a submission. This means that
 * either of (library & solutionTemplate) xor (choices) must
 * be present, and either of (solution) xor (answer) must be present.
 *
 * @property roomId This property is already present in GradingQuestion,
 *   and thus does not need to be used here, and is set to null
 * @property solution this can be either the answer to the MCQ, the solution to
 *   a programming question, or null.
 */
export type AnsweredQuestion = Question & Answer;

type Answer = {
  roomId: null;
  autogradingResults: AutogradingResult[];
  prepend: string;
  postpend: string;
  testcases: Testcase[];
  solution: number | string | null;
  answer: string | number | null;
  maxGrade: number;
  maxXp: number;
  solutionTemplate?: string;
  choices?: MCQChoice[];
};