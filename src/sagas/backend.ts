/*eslint no-eval: "error"*/
/*eslint-env browser*/
import { delay, SagaIterator } from 'redux-saga'
import { call, put, select, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { WorkspaceLocation } from '../actions/workspaces'
import {
  AssessmentCategory,
  ExternalLibraryName,
  IAssessment,
  IAssessmentOverview,
  IQuestion
} from '../components/assessment/assessmentShape'
import { store } from '../createStore'
import { IState, Role } from '../reducers/states'
import { BACKEND_URL } from '../utils/constants'
import { history } from '../utils/history'
import { showSuccessMessage, showWarningMessage } from '../utils/notification'

/**
 * @property accessToken - backend access token
 * @property errorMessage - message to showWarningMessage on failure
 * @property body - request body, for HTTP POST
 * @property noHeaderAccept - if Accept: application/json should be omitted
 * @property refreshToken - backend refresh token
 * @property shouldRefresh - if should attempt to refresh access token
 *
 * If shouldRefresh, accessToken and refreshToken are required.
 */
type RequestOptions = {
  accessToken?: string
  errorMessage?: string
  body?: object
  noHeaderAccept?: boolean
  refreshToken?: string
  shouldAutoLogout?: boolean
  shouldRefresh?: boolean
}

type Tokens = {
  accessToken: string
  refreshToken: string
}

function* backendSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_AUTH, function*(action) {
    const ivleToken = (action as actionTypes.IAction).payload
    const tokens = yield call(postAuth, ivleToken)
    const user = tokens ? yield call(getUser, tokens) : null
    if (tokens && user) {
      yield put(actions.setTokens(tokens))
      yield put(actions.setRole(user.role))
      yield put(actions.setUsername(user.name))
      yield delay(2000)
      yield history.push('/academy')
    } else {
      yield history.push('/')
    }
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }))
    const assessmentOverviews = yield call(getAssessmentOverviews, tokens)
    if (assessmentOverviews) {
      yield put(actions.updateAssessmentOverviews(assessmentOverviews))
    }
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }))
    const id = (action as actionTypes.IAction).payload
    const assessment: IAssessment = yield call(getAssessment, id, tokens)
    if (assessment) {
      yield put(actions.updateAssessment(assessment))
    }
  })

  yield takeEvery(actionTypes.SUBMIT_ANSWER, function*(action) {
    const role = yield select((state: IState) => state.session.role!)
    if (role !== Role.Student) {
      return yield call(showWarningMessage, 'Only students can submit answers.')
    }
    const tokens = yield select((state: IState) => ({
      accessToken: state.session.accessToken,
      refreshToken: state.session.refreshToken
    }))
    const questionId = (action as actionTypes.IAction).payload.id
    const answer = (action as actionTypes.IAction).payload.answer
    const resp = yield call(postAnswer, questionId, answer, tokens)
    if (resp && resp.ok) {
      yield call(showSuccessMessage, 'Saved!', 1000)
      // Now, update the answer for the question in the assessment in the store
      const assessmentId = yield select(
        (state: IState) => state.workspaces.assessment.currentAssessment!
      )
      const assessment = yield select((state: IState) =>
        state.session.assessments.get(assessmentId)
      )
      const newQuestions = assessment.questions.slice().map((question: IQuestion) => {
        if (question.id === questionId) {
          question.answer = answer
        }
        return question
      })
      const newAssessment = {
        ...assessment,
        questions: newQuestions
      }
      yield put(actions.updateAssessment(newAssessment))
      yield put(actions.updateHasUnsavedChanges('assessment' as WorkspaceLocation, false))
    } else if (resp !== null) {
      let errorMessage: string
      switch (resp.status) {
        case 403:
          errorMessage = 'Session expired. Please login again.'
          break
        case 400:
          errorMessage = "Can't save an empty answer."
          break
        default:
          errorMessage = `Something went wrong (got ${resp.status} response)`
          break
      }
      yield call(showWarningMessage, errorMessage)
    } else {
      // postAnswer returns null for failed fetch
      yield call(showWarningMessage, "Couldn't reach our servers. Are you online?")
    }
  })
}

/**
 * POST /auth
 */
async function postAuth(ivleToken: string): Promise<Tokens | null> {
  const response = await request3('auth', 'POST', {
    body: { login: { ivle_token: ivleToken } },
    errorMessage: 'Could not login. Please contact the module administrator.'
  })
  if (response) {
    const tokens = await response.json()
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  } else {
    return null
  }
}

/**
 * POST /auth/refresh
 */
async function postRefresh(refreshToken: string): Promise<Tokens | null> {
  const response = await request3('auth/refresh', 'POST', {
    body: { refresh_token: refreshToken }
  })
  if (response) {
    const tokens = await response.json()
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  } else {
    return null
  }
}

/**
 * GET /user
 */
async function getUser(tokens: Tokens): Promise<object | null> {
  const response = await request3('user', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  })
  if (response && response.ok) {
    return await response.json()
  } else {
    return null
  }
}

/**
 * GET /assessments
 */
async function getAssessmentOverviews(tokens: Tokens): Promise<IAssessmentOverview[] | null> {
  const response = await request3('assessments', 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  })
  if (response && response.ok) {
    const assessmentOverviews = await response.json()
    // backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
    //              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
    return assessmentOverviews.map((overview: any) => {
      overview.category = capitalise(overview.type)
      delete overview.type
      return overview as IAssessmentOverview
    })
  } else {
    return null // invalid accessToken _and_ refreshToken
  }
}

/**
 * GET /assessments/${assessmentId}
 */
async function getAssessment(id: number, tokens: Tokens): Promise<IAssessment | null> {
  const response = await request3(`assessments/${id}`, 'GET', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    shouldRefresh: true
  })
  if (response && response.ok) {
    const assessment = (await response.json()) as IAssessment
    // backend has property ->     type: 'mission' | 'sidequest' | 'path' | 'contest'
    //              we have -> category: 'Mission' | 'Sidequest' | 'Path' | 'Contest'
    assessment.category = capitalise((assessment as any).type) as AssessmentCategory
    delete (assessment as any).type
    assessment.questions = assessment.questions.map(q => {
      // Make library.external.name uppercase
      q.library.external.name = q.library.external.name.toUpperCase() as ExternalLibraryName
      // Make globals into an Array of (string, value)
      q.library.globals = Object.entries(q.library.globals as object).map(entry => {
        try {
          entry[1] = (window as any).eval(entry[1])
        } catch (e) {}
        return entry
      })
      return q
    })
    return assessment
  } else {
    return null
  }
}

/**
 * POST /assessments/question/${questionId}/submit
 */
async function postAnswer(
  id: number,
  answer: string | number,
  tokens: Tokens
): Promise<Response | null> {
  const resp = await request3(`assessments/question/${id}/submit`, 'POST', {
    accessToken: tokens.accessToken,
    body: { answer: `${answer}` },
    noHeaderAccept: true,
    refreshToken: tokens.refreshToken,
    shouldAutoLogout: false,
    shouldRefresh: true
  })
  return resp
}

/**
 * @returns {(Response|null)} Response if successful, otherwise null.
 *
 * @see @type{RequestOptions} for options to this function.
 *
 * If opts.shouldRefresh, an initial response status of < 200 or > 299 will
 * cause this function to call postRefresh to attempt to setToken with fresh
 * tokens.
 *
 * If fetch throws an error, or final response has status code < 200 or > 299,
 * this function will cause the user to logout.
 */
async function request3(
  path: string,
  method: string,
  opts: RequestOptions
): Promise<Response | null> {
  console.log(`${method} ${path}; ${JSON.stringify(opts)}`) // tslint:disable-line
  const headers = new Headers()
  if (!opts.noHeaderAccept) {
    headers.append('Accept', 'application/json')
  }
  if (method === 'POST') {
    headers.append('Content-Type', 'application/json')
  }
  if (opts.accessToken) {
    headers.append('Authorization', `Bearer ${opts.accessToken}`)
  }
  const fetchOpts: any = { method, headers }
  if (opts.body) {
    fetchOpts.body = JSON.stringify(opts.body)
  }
  try {
    const response = await fetch(`${BACKEND_URL}/v1/${path}`, fetchOpts)
    // response.ok is (200 <= response.status <= 299)
    // response.status of > 299 does not raise error; so deal with in in the try clause
    if (response && response.ok) {
      return response
    } else if (opts.shouldRefresh && response.status === 401) {
      const newTokens = await postRefresh(opts.refreshToken!)
      store.dispatch(actions.setTokens(newTokens))
      const newOpts = {
        ...opts,
        accessToken: newTokens!.accessToken,
        shouldRefresh: false
      }
      return request3(path, method, newOpts)
    } else if (response && opts.shouldAutoLogout === false) {
      // this clause is mostly for SUBMIT_ANSWER; show an error message instead
      // and ask student to manually logout, so that they have a change to save
      // their answers
      return response
    } else {
      throw new Error('API call failed or got non-OK response')
    }
  } catch (e) {
    store.dispatch(actions.logOut())
    showWarningMessage(opts.errorMessage ? opts.errorMessage : 'Please login again.')
    return null
  }
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export default backendSaga
