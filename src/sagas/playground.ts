import { compressToEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import { SagaIterator } from 'redux-saga';
import { put, select, takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';
import * as actionTypes from '../actions/actionTypes';
import { ExternalLibraryName } from '../components/assessment/assessmentShape';
import { defaultEditorValue, ISourceLanguage, IState, languageURLNames } from '../reducers/states';

import { Variant } from 'js-slang/dist/types';

export default function* playgroundSaga(): SagaIterator {
  yield takeEvery(actionTypes.GENERATE_LZ_STRING, updateQueryString);
}

function* updateQueryString() {
  const code: string | null = yield select(
    (state: IState) => state.workspaces.playground.editorValue
  );
  if (!code || code === defaultEditorValue) {
    yield put(actions.changeQueryString(''));
    return;
  }
  const codeString: string = code as string;
  const chapter: number = yield select(
    (state: IState) => state.workspaces.playground.context.chapter
  );
  const variant: Variant = yield select(
    (state: IState) => state.workspaces.playground.context.variant
  );

  let languageUrlName: string = chapter.toString();
  for (const name of languageURLNames.keys()) {
    const language: ISourceLanguage = languageURLNames.get(name)!;
    if (language.chapter === chapter && language.variant === variant) {
      languageUrlName = name;
      break;
    }
  }

  const external: ExternalLibraryName = yield select(
    (state: IState) => state.workspaces.playground.externalLibrary
  );
  const execTime: number = yield select((state: IState) => state.workspaces.playground.execTime);
  const newQueryString: string = qs.stringify({
    prgrm: compressToEncodedURIComponent(codeString),
    chap: languageUrlName,
    ext: external,
    exec: execTime
  });
  yield put(actions.changeQueryString(newQueryString));
}
