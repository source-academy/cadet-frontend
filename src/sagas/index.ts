import { compressToEncodedURIComponent } from 'lz-string'
import * as qs from 'query-string'
import { SagaIterator } from 'redux-saga'
import { call, put, race, select, take, takeEvery } from 'redux-saga/effects'

import * as actions from '../actions'
import * as actionTypes from '../actions/actionTypes'
import { mockAssessmentOverviews, mockAssessments } from '../mocks/api'
import { IState } from '../reducers/states'
import { Context, interrupt, runInContext } from '../slang'
import { IVLE_KEY } from '../utils/constants'
import { showSuccessMessage, showWarningMessage } from '../utils/notification'

function* mainSaga() {
  yield* apiFetchSaga()
  yield* interpreterSaga()
  yield* loginSaga()
  yield* playgroundSaga()
}

function* apiFetchSaga(): SagaIterator {
  yield takeEvery(actionTypes.FETCH_ASSESSMENT_OVERVIEWS, function*() {
    const newContent = mockAssessmentOverviews
    const oldContent = yield select((state: IState) => state.session.assessmentOverviews)
    if (newContent !== oldContent) {
      yield put(actions.updateAssessmentOverviews(newContent))
    }
  })

  yield takeEvery(actionTypes.FETCH_ASSESSMENT, function*(action) {
    const id = (action as actionTypes.IAction).payload
    const newContent = mockAssessments[id]
    const oldContent = yield select((state: IState) => state.session.assessments[id])
    if (newContent !== oldContent) {
      yield put(actions.updateAssessment(newContent))
    }
  })
}

function* interpreterSaga(): SagaIterator {
  let context: Context

  yield takeEvery(actionTypes.EVAL_EDITOR, function*(action) {
    const location = (action as actionTypes.IAction).payload.location
    const code: string = yield select((state: IState) => state.playground.editorValue)
    yield put(actions.clearContext(location))
    yield put(actions.clearReplOutput(location))
    context = yield select((state: IState) => state.playground.context)
    yield* evalCode(code, context)
  })

  yield takeEvery(actionTypes.EVAL_REPL, function*(action) {
    const location = (action as actionTypes.IAction).payload.location
    const code: string = yield select((state: IState) => state.playground.replValue)
    context = yield select((state: IState) => state.playground.context)
    yield put(actions.clearReplInput(location))
    yield put(actions.sendReplInputToOutput(code, location))
    yield* evalCode(code, context)
  })

  yield takeEvery(actionTypes.CHAPTER_SELECT, function*(action) {
    const location = (action as actionTypes.IAction).payload.location
    const newChapter = parseInt((action as actionTypes.IAction).payload, 10)
    const oldChapter = yield select((state: IState) => state.playground.sourceChapter)
    if (newChapter !== oldChapter) {
      yield put(actions.changeChapter(newChapter, location))
      yield put(actions.clearContext(location))
      yield put(actions.clearReplOutput(location))
      yield call(showSuccessMessage, `Switched to Source \xa7${newChapter}`)
    }
  })
}

function* loginSaga(): SagaIterator {
  yield takeEvery(actionTypes.LOGIN, function*() {
    const apiLogin = 'https://ivle.nus.edu.sg/api/login/'
    const key = IVLE_KEY
    const callback = `${window.location.protocol}//${window.location.hostname}/academy`
    window.location.href = `${apiLogin}?apikey=${key}&url=${callback}`
    yield undefined
  })

  yield takeEvery(actionTypes.FETCH_USERNAME, function*() {
    // TODO: use an API call to the backend; an api call to IVLE raises an
    // uncaught error due to restrictive Access-Control-Allow-Origin headers,
    // causing the staging server to bug out
    const username = yield call(() => 'IVLE USER')
    yield put(actions.setUsername(username))
  })
}

function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, function*() {
    const code = yield select((state: IState) => state.playground.editorValue)
    const lib = yield select((state: IState) => state.playground.sourceChapter)
    const newQueryString =
      code === ''
        ? undefined
        : qs.stringify({
            prgrm: compressToEncodedURIComponent(code),
            lib
          })
    yield put(actions.changeQueryString(newQueryString))
  })
}

function* evalCode(code: string, context: Context) {
  const { result, interrupted } = yield race({
    result: call(runInContext, code, context, { scheduler: 'async' }),
    interrupted: take(actionTypes.INTERRUPT_EXECUTION)
  })
  if (result) {
    if (result.status === 'finished') {
      yield put(actions.evalInterpreterSuccess(result.value))
    } else {
      yield put(actions.evalInterpreterError(context.errors))
    }
  } else if (interrupted) {
    interrupt(context)
    yield call(showWarningMessage, 'Execution aborted by user')
  }
}

export default mainSaga
