/*
 * Used to display information regarding an assessment in the UI.
 *
 * @property closeAt an ISO 8601 compliant date string specifiying when
 *   the assessment closes
 * @property openAt an ISO 8601 compliant date string specifiying when
 *   the assessment opens
 */
export interface IAssessmentOverview {
  category: AssessmentCategory;
  closeAt: string;
  coverImage: string;
  grade: number;
  id: number;
  maxGrade: number;
  maxXp: number;
  openAt: string;
  title: string;
  shortSummary: string;
  status: AssessmentStatus;
  story: string | null;
  xp: number;
  gradingStatus: GradingStatus;
}

export enum AssessmentStatuses {
  not_attempted = 'not_attempted',
  attempting = 'attempting',
  attempted = 'attempted',
  submitted = 'submitted'
}

export type AssessmentStatus = keyof typeof AssessmentStatuses;

export enum GradingStatuses {
  none = 'none',
  grading = 'grading',
  graded = 'graded'
}

export type GradingStatus = keyof typeof GradingStatuses;

/*
 * Used when an assessment is being actively attempted/graded.
 */
export interface IAssessment {
  category: AssessmentCategory;
  id: number;
  longSummary: string;
  missionPDF: string;
  questions: IQuestion[];
  title: string;
}

/* The different kinds of Assessments available */
export enum AssessmentCategories {
  Contest = 'Contest',
  Mission = 'Mission',
  Path = 'Path',
  Sidequest = 'Sidequest'
}

export type AssessmentCategory = keyof typeof AssessmentCategories;

export interface IProgrammingQuestion extends IQuestion {
  answer: string | null;
  solutionTemplate: string;
  type: 'programming';
}

export interface IMCQQuestion extends IQuestion {
  solution: number | null;
  answer: number | null;
  choices: MCQChoice[];
  type: 'mcq';
}

export interface IQuestion {
  answer: string | number | null;
  comment: string | null;
  content: string;
  id: number;
  library: Library;
  type: QuestionType;
  grader: {
    name: string;
    id: number;
  };
  gradedAt: string;
  xp: number;
  grade: number;
  maxGrade: number;
  maxXp: number;
}

export type MCQChoice = {
  content: string;
  hint: string | null;
};

/* The two kinds of Questions available */
export enum QuestionTypes {
  programming = 'programming',
  mcq = 'mcq'
}
export type QuestionType = keyof typeof QuestionTypes;

/** Constants for external library names */
export enum ExternalLibraryNames {
  NONE = 'NONE',
  TWO_DIM_RUNES = 'TWO_DIM_RUNES',
  THREE_DIM_RUNES = 'THREE_DIM_RUNES',
  CURVES = 'CURVES',
  SOUND = 'SOUND',
  STREAMS = 'STREAMS'
}

export type ExternalLibraryName = keyof typeof ExternalLibraryNames;

type ExternalLibrary = {
  name: ExternalLibraryName;
  symbols: string[];
};

export type Library = {
  chapter: number;
  external: ExternalLibrary;
  globals: Array<[string, any]>;
};
