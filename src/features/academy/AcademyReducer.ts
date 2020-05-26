import { Reducer } from 'redux';

import { defaultAcademy } from 'src/commons/application/ApplicationTypes';
import { LOG_OUT } from 'src/commons/application/types/ActionTypes';
import { SourceActionType } from 'src/utils/actionsHelper';

import { AcademyState, SAVE_CANVAS } from './AcademyTypes';

export const AcademyReducer: Reducer<AcademyState> = (
  state = defaultAcademy,
  action: SourceActionType
) => {
  switch (action.type) {
    case LOG_OUT:
      return defaultAcademy;
    case SAVE_CANVAS:
      return {
        ...state,
        gameCanvas: action.payload
      };
    default:
      return state;
  }
};
