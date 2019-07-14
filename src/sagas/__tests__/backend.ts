import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import * as actions from '../../actions';
import * as actionTypes from '../../actions/actionTypes';
import { WorkspaceLocation } from '../../actions/workspaces';
import {
  AssessmentStatuses,
  IAssessment,
  IQuestion
} from '../../components/assessment/assessmentShape';
import {
  mockAssessmentOverviews,
  mockAssessmentQuestions,
  mockAssessments
} from '../../mocks/assessmentAPI';
import { Role } from '../../reducers/states';
import { showSuccessMessage, showWarningMessage } from '../../utils/notification';
import backendSaga, {
  getAssessment,
  getAssessmentOverviews,
  getUser,
  postAnswer,
  postAssessment,
  postAuth
} from '../backend';

// ----------------------------------------
// Constants to use for testing

const mockAssessment: IAssessment = mockAssessments[0];

const mockMapAssessments = new Map<number, IAssessment>(mockAssessments.map(a => [a.id, a]));

const mockAssessmentQuestion = mockAssessmentQuestions[0];

const mockTokens = { accessToken: 'access', refreshToken: 'refresherOrb' };

// mock states here starts as student
const mockStates = {
  session: {
    accessToken: 'access',
    assessmentOverviews: mockAssessmentOverviews,
    assessments: mockMapAssessments,
    refreshToken: 'refresherOrb',
    role: Role.Student
  },
  workspaces: {
    assessment: { currentAssessment: 0 }
  }
};

const okResp = { ok: true };
const errorResp = { ok: false };
// ----------------------------------------

describe('Test FETCH_AUTH Action', () => {
  test('when tokens and user obtained', () => {
    const luminusCode = 'luminusCode';
    const user = 'user';
    return expectSaga(backendSaga)
      .call(postAuth, luminusCode)
      .call(getUser, mockTokens)
      .put(actions.setTokens(mockTokens))
      .put(actions.setUser(user))
      .provide([[call(postAuth, luminusCode), mockTokens], [call(getUser, mockTokens), user]])
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminusCode })
      .silentRun();
  });
  test('when tokens is null', () => {
    const luminusCode = 'luminusCode';
    const user = 'user';
    return expectSaga(backendSaga)
      .provide([[call(postAuth, luminusCode), null], [call(getUser, mockTokens), user]])
      .call(postAuth, luminusCode)
      .not.call.fn(getUser)
      .not.put.actionType(actionTypes.SET_TOKENS)
      .not.put.actionType(actionTypes.SET_USER)
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminusCode })
      .silentRun();
  });
  test('when user is null', () => {
    const luminusCode = 'luminusCode';
    const nullUser = null;
    return expectSaga(backendSaga)
      .provide([[call(postAuth, luminusCode), mockTokens], [call(getUser, mockTokens), nullUser]])
      .call(postAuth, luminusCode)
      .call(getUser, mockTokens)
      .not.put.actionType(actionTypes.SET_TOKENS)
      .not.put.actionType(actionTypes.SET_USER)
      .dispatch({ type: actionTypes.FETCH_AUTH, payload: luminusCode })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT_OVERVIEWS Action', () => {
  test('when assesments is obtained', () => {
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), mockAssessmentOverviews]])
      .put(actions.updateAssessmentOverviews(mockAssessmentOverviews))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });

  test('when assessments overviews is null', () => {
    const ret = null;
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessmentOverviews, mockTokens), ret]])
      .call(getAssessmentOverviews, mockTokens)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT_OVERVIEWS })
      .silentRun();
  });
});

describe('Test FETCH_ASSESSMENT Action', () => {
  test('when assesment is obtained', () => {
    const mockId = 0;
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens), mockAssessment]])
      .put(actions.updateAssessment(mockAssessment))
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });

  test('when assesment is null', () => {
    const mockId = 0;
    return expectSaga(backendSaga)
      .withState({ session: mockTokens })
      .provide([[call(getAssessment, mockId, mockTokens), null]])
      .call(getAssessment, mockId, mockTokens)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .hasFinalState({ session: mockTokens })
      .dispatch({ type: actionTypes.FETCH_ASSESSMENT, payload: mockId })
      .silentRun();
  });
});

describe('Test SUBMIT_ANSWER Action', () => {
  test('when respond is ok', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    const mockNewQuestions = mockAssessment.questions.slice().map((question: IQuestion) => {
      if (question.id === mockAnsweredAssessmentQuestion.id) {
        return { ...question, answer: mockAnsweredAssessmentQuestion.answer };
      }
      return question;
    });
    const mockNewAssessment = {
      ...mockAssessment,
      questions: mockNewQuestions
    };
    expectSaga(backendSaga)
      .withState(mockStates)
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          okResp
        ]
      ])
      .not.call.fn(showWarningMessage)
      .call(showSuccessMessage, 'Saved!', 1000)
      .put(actions.updateAssessment(mockNewAssessment))
      .put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
    // To make sure no changes in state
    return expect(mockStates.session.assessments.get(0)!.questions[0].answer).toEqual(null);
  });

  test('when role is not student', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState({ session: { role: Role.Staff } })
      .call(showWarningMessage, 'Only students can submit answers.')
      .not.call.fn(postAnswer)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { role: Role.Staff } })
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });

  test('when respond is null', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          null
        ]
      ])
      .call(
        postAnswer,
        mockAnsweredAssessmentQuestion.id,
        mockAnsweredAssessmentQuestion.answer,
        mockTokens
      )
      .call(showWarningMessage, "Couldn't reach our servers. Are you online?")
      .not.call.fn(showSuccessMessage)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });

  test('when respond is error', () => {
    const mockAnsweredAssessmentQuestion = { ...mockAssessmentQuestion, answer: '42' };
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([
        [
          call(
            postAnswer,
            mockAnsweredAssessmentQuestion.id,
            mockAnsweredAssessmentQuestion.answer,
            mockTokens
          ),
          errorResp
        ]
      ])
      .call.fn(showWarningMessage)
      .not.call.fn(showSuccessMessage)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT)
      .not.put.actionType(actionTypes.UPDATE_HAS_UNSAVED_CHANGES)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ANSWER, payload: mockAnsweredAssessmentQuestion })
      .silentRun();
  });
});

describe('Test SUBMIT_ASSESSMENT Action', () => {
  test('when respond is ok', () => {
    const mockAssessmentId = 0;
    const mockNewOverviews = mockAssessmentOverviews.map(overview => {
      if (overview.id === mockAssessmentId) {
        return { ...overview, status: AssessmentStatuses.submitted };
      }
      return overview;
    });
    expectSaga(backendSaga)
      .withState(mockStates)
      .provide([[call(postAssessment, mockAssessmentId, mockTokens), okResp]])
      .not.call(showWarningMessage)
      .call(showSuccessMessage, 'Submitted!', 2000)
      .put(actions.updateAssessmentOverviews(mockNewOverviews))
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: mockAssessmentId })
      .silentRun();
    expect(mockStates.session.assessmentOverviews[0].id).toEqual(0);
    return expect(mockStates.session.assessmentOverviews[0].status).not.toEqual(
      AssessmentStatuses.submitted
    );
  });

  test('when respond is error', () => {
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), errorResp]])
      .call(postAssessment, 0, mockTokens)
      .call(showWarningMessage, 'Something went wrong. Please try again.')
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when respond is null', () => {
    return expectSaga(backendSaga)
      .withState({ session: { ...mockTokens, role: Role.Student } })
      .provide([[call(postAssessment, 0, mockTokens), null]])
      .call(postAssessment, 0, mockTokens)
      .call(showWarningMessage, 'Something went wrong. Please try again.')
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { ...mockTokens, role: Role.Student } })
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });

  test('when role is not a student', () => {
    return expectSaga(backendSaga)
      .withState({ session: { role: Role.Staff } })
      .call(showWarningMessage, 'Only students can submit assessments.')
      .not.call.fn(postAssessment)
      .not.put.actionType(actionTypes.UPDATE_ASSESSMENT_OVERVIEWS)
      .hasFinalState({ session: { role: Role.Staff } })
      .dispatch({ type: actionTypes.SUBMIT_ASSESSMENT, payload: 0 })
      .silentRun();
  });
});
