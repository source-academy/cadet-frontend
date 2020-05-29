import { Grading, GradingOverview } from '../../../features/grading/GradingTypes';
import { Assessment, AssessmentOverview } from '../../assessment/AssessmentTypes';
import { Notification } from '../../notificationBadge/NotificationBadgeTypes';
import { HistoryHelper } from '../../utils/HistoryHelper';
import { GameState, Role, Story } from '../ApplicationTypes';

import { Announcement } from 'src/components/Announcements'; // TODO: Remove
import { DirectoryData, MaterialData } from 'src/components/material/materialShape'; // TODO: Remove

export const FETCH_ANNOUNCEMENTS = 'FETCH_ANNOUNCEMENTS';
export const FETCH_AUTH = 'FETCH_AUTH';
export const FETCH_ASSESSMENT = 'FETCH_ASSESSMENT';
export const FETCH_ASSESSMENT_OVERVIEWS = 'FETCH_ASSESSMENT_OVERVIEWS';
export const FETCH_GRADING = 'FETCH_GRADING';
export const FETCH_GRADING_OVERVIEWS = 'FETCH_GRADING_OVERVIEWS';
export const LOGIN = 'LOGIN';
export const SET_TOKENS = 'SET_TOKENS';
export const SET_USER = 'SET_USER';
export const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
export const SUBMIT_ASSESSMENT = 'SUBMIT_ASSESSMENT';
export const SUBMIT_GRADING = 'SUBMIT_GRADING';
export const SUBMIT_GRADING_AND_CONTINUE = 'SUBMIT_GRADING_AND_CONTINUE';
export const UNSUBMIT_SUBMISSION = 'UNSUBMIT_SUBMISSION';
export const UPDATE_HISTORY_HELPERS = 'UPDATE_HISTORY_HELPERS';
export const UPDATE_ASSESSMENT_OVERVIEWS = 'UPDATE_ASSESSMENT_OVERVIEWS';
export const UPDATE_ASSESSMENT = 'UPDATE_ASSESSMENT';
export const UPDATE_GRADING_OVERVIEWS = 'UPDATE_GRADING_OVERVIEWS';
export const UPDATE_GRADING = 'UPDATE_GRADING';
export const FETCH_NOTIFICATIONS = 'FETCH_NOTIFICATIONS';
export const ACKNOWLEDGE_NOTIFICATIONS = 'ACKNOWLEDGE_NOTIFICATIONS';
export const UPDATE_NOTIFICATIONS = 'UPDATE_NOTIFICATIONS';
export const NOTIFY_CHATKIT_USERS = 'NOTIFY_CHATKIT_USERS'; // TODO: Remove

export type SessionState = {
  readonly accessToken?: string;
  readonly assessmentOverviews?: AssessmentOverview[];
  readonly assessments: Map<number, Assessment>;
  readonly announcements?: Announcement[]; // TODO: Remove
  readonly grade: number;
  readonly gradingOverviews?: GradingOverview[];
  readonly gradings: Map<number, Grading>;
  readonly group: string | null;
  readonly historyHelper: HistoryHelper;
  readonly materialDirectoryTree: DirectoryData[] | null;
  readonly materialIndex: MaterialData[] | null;
  readonly maxGrade: number;
  readonly maxXp: number;
  readonly refreshToken?: string;
  readonly role?: Role;
  readonly story: Story;
  readonly gameState: GameState;
  readonly name?: string;
  readonly xp: number;
  readonly notifications: Notification[];
};
