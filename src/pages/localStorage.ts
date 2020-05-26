import { Variant } from 'js-slang/dist/types';

import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

import {  OverallState } from 'src/commons/application/ApplicationTypes';
import { ExternalLibraryName } from 'src/commons/application/types/ExternalTypes';
import { SessionState } from 'src/commons/application/types/SessionTypes';
import { showWarningMessage } from 'src/utils/notification';

export type SavedState = {
  session: Partial<SessionState>;
  playgroundEditorValue: string | null;
  playgroundIsEditorAutorun: boolean;
  playgroundSourceChapter: number;
  playgroundSourceVariant: Variant;
  playgroundExternalLibrary: ExternalLibraryName;
};

export const loadStoredState = (): SavedState | undefined => {
  try {
    const serializedState = localStorage.getItem('storedState');
    if (!serializedState) {
      return undefined;
    }
    return JSON.parse(decompressFromUTF16(serializedState)) as SavedState;
  } catch (err) {
    showWarningMessage('Error loading from local storage');
    return undefined;
  }
};

export const saveState = (state: OverallState) => {
  try {
    const stateToBeSaved: SavedState = {
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
