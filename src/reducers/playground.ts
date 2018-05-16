import { Action, Reducer } from 'redux'
import { IUpdateEditorValue, UPDATE_EDITOR_VALUE } from '../actions/playground'

export interface IPlaygroundState {
  editorValue: string
}

/**
 * The default (initial) state of the `IPlaygroundState`
 */
const defaultState: IPlaygroundState = {
  editorValue: ''
}

/**
 * The reducer for `IPlaygroundState`
 *
 * UPDATE_EDITOR_VALUE: Update the `editorValue` property
 */
export const reducer: Reducer<IPlaygroundState> = (state = defaultState, action: Action) => {
  switch (action.type) {
    case UPDATE_EDITOR_VALUE:
      return {
        ...state,
        editorValue: (action as IUpdateEditorValue).payload
      }
    default:
      return state
  }
}
