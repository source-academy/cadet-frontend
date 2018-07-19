import { ActionCreator } from 'redux'

import { ExternalLibraryName } from '../reducers/externalLibraries'
import * as actionTypes from './actionTypes'

/**
 * Used to differenciate between the sources of actions, as
 * two workspaces can work at the same time. To generalise this
 * or add more instances of `Workspace`s, one can add a string,
 * and call the actions with the respective string (taken
 * from the below enum).
 *
 * Note that the names must correspond with the name of the
 * object in IWorkspaceManagerState.
 */
export enum WorkspaceLocations {
  assessment = 'assessment',
  playground = 'playground',
  grading = 'grading'
}

export type WorkspaceLocation = keyof typeof WorkspaceLocations

export const browseReplHistoryDown: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.BROWSE_REPL_HISTORY_DOWN,
  payload: { workspaceLocation }
})

export const browseReplHistoryUp: ActionCreator<actionTypes.IAction> = (
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.BROWSE_REPL_HISTORY_UP,
  payload: { workspaceLocation }
})

export const changeActiveTab: ActionCreator<actionTypes.IAction> = (
  activeTab: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_ACTIVE_TAB,
  payload: { activeTab, workspaceLocation }
})

export const changePlaygroundExternal: ActionCreator<actionTypes.IAction> = (
  newExternal: string
) => ({
  type: actionTypes.CHANGE_PLAYGROUND_EXTERNAL,
  payload: { newExternal }
})

export const changeEditorWidth: ActionCreator<actionTypes.IAction> = (
  widthChange: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_EDITOR_WIDTH,
  payload: { widthChange, workspaceLocation }
})

export const changeSideContentHeight: ActionCreator<actionTypes.IAction> = (
  height: number,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHANGE_SIDE_CONTENT_HEIGHT,
  payload: { height, workspaceLocation }
})

export const chapterSelect: ActionCreator<actionTypes.IAction> = (
  chapter,
  changeEvent,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CHAPTER_SELECT,
  payload: {
    chapter: chapter.chapter,
    workspaceLocation
  }
})

export const playgroundExternalSelect: ActionCreator<actionTypes.IAction> = (
  external,
  changeEvent,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.PLAYGROUND_EXTERNAL_SELECT,
  payload: {
    external: external.displayName,
    workspaceLocation
  }
})

/**
 * Clears the js-slang Context at a specified workspace location.
 *
 * @param chapter the SICP chapter for the context to be set in
 * @param externals a list of symbols to be exposed from the global scope
 * @param externalLibraryName the name of the external library used
 * @param workspaceLocation the location of the workspace
 */
export const clearContext = (
  chapter: number,
  externals: string[],
  externalLibraryName: ExternalLibraryName,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.CLEAR_CONTEXT,
  payload: {
    chapter,
    externals,
    externalLibraryName,
    workspaceLocation
  }
})

export const clearReplInput = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.CLEAR_REPL_INPUT,
  payload: { workspaceLocation }
})

export const clearReplOutput = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.CLEAR_REPL_OUTPUT,
  payload: { workspaceLocation }
})

export const evalEditor = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_EDITOR,
  payload: { workspaceLocation }
})

export const evalRepl = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.EVAL_REPL,
  payload: { workspaceLocation }
})

export const updateEditorValue: ActionCreator<actionTypes.IAction> = (
  newEditorValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_EDITOR_VALUE,
  payload: { newEditorValue, workspaceLocation }
})

export const updateReplValue: ActionCreator<actionTypes.IAction> = (
  newReplValue: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.UPDATE_REPL_VALUE,
  payload: { newReplValue, workspaceLocation }
})

export const sendReplInputToOutput: ActionCreator<actionTypes.IAction> = (
  newOutput: string,
  workspaceLocation: WorkspaceLocation
) => ({
  type: actionTypes.SEND_REPL_INPUT_TO_OUTPUT,
  payload: {
    type: 'code',
    workspaceLocation,
    value: newOutput
  }
})

export const resetWorkspace = (workspaceLocation: WorkspaceLocation) => ({
  type: actionTypes.RESET_WORKSPACE,
  payload: {
    workspaceLocation
  }
})

export const updateCurrentAssessmentId = (assessmentId: number, questionId: number) => ({
  type: actionTypes.UPDATE_CURRENT_ASSESSMENT_ID,
  payload: {
    assessmentId,
    questionId
  }
})

export const updateCurrentSubmissionId = (submissionId: number, questionId: number) => ({
  type: actionTypes.UPDATE_CURRENT_SUBMISSION_ID,
  payload: {
    submissionId,
    questionId
  }
})

export const updateGradingCommentsValue: ActionCreator<actionTypes.IAction> = (
  newComments: string
) => ({
  type: actionTypes.UPDATE_GRADING_COMMENTS_VALUE,
  payload: newComments
})

export const updateGradingXP: ActionCreator<actionTypes.IAction> = (newXP: number) => ({
  type: actionTypes.UPDATE_GRADING_XP,
  payload: newXP
})

export const saveGradingInput: ActionCreator<actionTypes.IAction> = (
  gradingCommentsValue: string,
  gradingXP: number | undefined
) => ({
  type: actionTypes.SAVE_GRADING_INPUT,
  payload: {
    gradingCommentsValue,
    gradingXP
  }
})
