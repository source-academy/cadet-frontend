import { Variant } from 'js-slang/dist/types';

import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

import { ExternalLibraryName } from './components/assessment/assessmentShape';
import { ISessionState, IState } from './reducers/states';
import { showWarningMessage } from './utils/notification';

export type ISavedState = {
  session: Partial<ISessionState>;
  playgroundEditorValue: string | null;
  playgroundIsEditorAutorun: boolean;
  playgroundSourceChapter: number;
  playgroundSourceVariant: Variant;
  playgroundExternalLibrary: ExternalLibraryName;
};

export const loadStoredState = (): ISavedState | undefined => {
  try {
    const serializedState = localStorage.getItem('storedState');
    if (!serializedState) {
      return undefined;
    }
    return JSON.parse(decompressFromUTF16(serializedState)) as ISavedState;
  } catch (err) {
    showWarningMessage('Error loading from local storage');
    return undefined;
  }
};

export const saveState = (state: IState) => {
  try {
    const stateToBeSaved: ISavedState = {
      session: {
        accessToken: state.session.accessToken,
        refreshToken: state.session.refreshToken,
        role: state.session.role,
        name: state.session.name
      },
      playgroundEditorValue: state.workspaces.playground.editorValue,
      playgroundIsEditorAutorun: state.workspaces.playground.isEditorAutorun,
      playgroundSourceChapter: state.workspaces.playground.context.chapter,
      playgroundSourceVariant: state.workspaces.playground.context.variant,
      playgroundExternalLibrary: state.workspaces.playground.externalLibrary
    };
    const serialized = compressToUTF16(JSON.stringify(stateToBeSaved));
    localStorage.setItem('storedState', serialized);
  } catch (err) {
    showWarningMessage('Error saving to local storage');
  }
};
