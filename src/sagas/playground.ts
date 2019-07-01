import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { put, select, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { ExternalLibraryName } from '../components/assessment/assessmentShape';
import { defaultEditorValue, IState } from '../reducers/states';

export default function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, updateQueryString);
}

function* updateQueryString() {
  const code: string | null = yield select((state: IState) => state.workspaces.playground.editorValue);
  if (code === null || code === '' || code === defaultEditorValue) {
    yield put(actions.changeQueryString(undefined));
  } else {
    const codeString: string = code as string;
    const chapter: number = yield select(
      (state: IState) => state.workspaces.playground.context.chapter
    );
    const external: ExternalLibraryName = yield select(
      (state: IState) => state.workspaces.playground.playgroundExternal
    );
    const newQueryString: string = qs.stringify({
      prgrm: compressToEncodedURIComponent(codeString),
      chap: chapter,
      ext: external
    });
    yield put(actions.changeQueryString(newQueryString));
  }
}
