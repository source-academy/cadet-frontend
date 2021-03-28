import { EditableText } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import React, { useContext, useMemo, useReducer } from 'react';

import { AchievementContext } from '../../../../features/achievement/AchievementConstants';
import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';
import ItemDeleter from '../common/ItemDeleter';
import ItemSaver from '../common/ItemSaver';
import AchievementSettings from './AchievementSettings';
import EditableAbility from './EditableAbility';
import {
  EditableCardAction as Action,
  EditableCardActionType as ActionType,
  EditableCardState as State
} from './EditableCardTypes';
import EditableDate from './EditableDate';
import EditableView from './EditableView';

type EditableCardProps = {
  uuid: string;
  releaseUuid: (uuid: string) => void;
  requestPublish: () => void;
};

const init = (achievement: AchievementItem): State => {
  return {
    editableAchievement: achievement,
    isDirty: false
  };
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CHANGES:
      return {
        ...state,
        isDirty: false
      };
    case ActionType.DISCARD_CHANGES:
      return init(action.payload);
    case ActionType.DELETE_ACHIEVEMENT:
      return {
        ...state,
        isDirty: false
      };
    case ActionType.CHANGE_ABILITY:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          ability: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_CARD_BACKGROUND:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          cardBackground: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_DEADLINE:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          deadline: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_GOAL_UUIDS:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          goalUuids: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_POSITION:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          isTask: action.payload !== 0,
          position: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_PREREQUISITE_UUIDS:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          prerequisiteUuids: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_RELEASE:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          release: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_TITLE:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          title: action.payload
        },
        isDirty: true
      };
    case ActionType.CHANGE_VIEW:
      return {
        editableAchievement: {
          ...state.editableAchievement,
          view: action.payload
        },
        isDirty: true
      };
    default:
      return state;
  }
};

function EditableCard(props: EditableCardProps) {
  const { uuid, releaseUuid, requestPublish } = props;

  const inferencer = useContext(AchievementContext);
  const achievement = inferencer.getAchievement(uuid);
  const achievementClone = useMemo(() => cloneDeep(achievement), [achievement]);

  const [state, dispatch] = useReducer(reducer, achievementClone, init);
  const { editableAchievement, isDirty } = state;
  const { ability, cardBackground, deadline, release, title, view } = editableAchievement;

  const saveChanges = () => {
    dispatch({ type: ActionType.SAVE_CHANGES });
    inferencer.modifyAchievement(editableAchievement);
    releaseUuid(uuid);
    requestPublish();
  };

  const discardChanges = () =>
    dispatch({ type: ActionType.DISCARD_CHANGES, payload: achievementClone });

  const deleteAchievement = () => {
    dispatch({ type: ActionType.DELETE_ACHIEVEMENT });
    inferencer.removeAchievement(uuid);
    releaseUuid(uuid);
    requestPublish();
  };

  const changeAbility = (ability: AchievementAbility) =>
    dispatch({ type: ActionType.CHANGE_ABILITY, payload: ability });

  const changeCardBackground = (cardBackground: string) =>
    dispatch({ type: ActionType.CHANGE_CARD_BACKGROUND, payload: cardBackground });

  const changeDeadline = (deadline?: Date) =>
    dispatch({ type: ActionType.CHANGE_DEADLINE, payload: deadline });

  const changeGoalUuids = (goalUuids: string[]) =>
    dispatch({ type: ActionType.CHANGE_GOAL_UUIDS, payload: goalUuids });

  const changePosition = (position: number) =>
    dispatch({ type: ActionType.CHANGE_POSITION, payload: position });

  const changePrerequisiteUuids = (prerequisiteUuids: string[]) =>
    dispatch({ type: ActionType.CHANGE_PREREQUISITE_UUIDS, payload: prerequisiteUuids });

  const changeRelease = (release?: Date) =>
    dispatch({ type: ActionType.CHANGE_RELEASE, payload: release });

  const changeTitle = (title: string) =>
    dispatch({ type: ActionType.CHANGE_TITLE, payload: title });

  const changeView = (view: AchievementView) =>
    dispatch({ type: ActionType.CHANGE_VIEW, payload: view });

  return (
    <li
      className="editable-card"
      style={{
        background: `url(${cardBackground}) center/cover`
      }}
    >
      <div className="action-button">
        {isDirty ? (
          <ItemSaver discardChanges={discardChanges} saveChanges={saveChanges} />
        ) : (
          <ItemDeleter deleteItem={deleteAchievement} item={title} />
        )}
      </div>

      <div className="content">
        <h3 className="title">
          <EditableText onChange={changeTitle} placeholder="Enter your title here" value={title} />
        </h3>
        <div className="details">
          <EditableAbility ability={ability} changeAbility={changeAbility} />
          <EditableDate changeDate={changeRelease} date={release} type="Release" />
          <EditableDate changeDate={changeDeadline} date={deadline} type="Deadline" />
        </div>
      </div>

      <div className="content-button">
        <EditableView changeView={changeView} view={view} />
        <AchievementSettings
          changeCardBackground={changeCardBackground}
          changeGoalUuids={changeGoalUuids}
          changePosition={changePosition}
          changePrerequisiteUuids={changePrerequisiteUuids}
          editableAchievement={editableAchievement}
        />
      </div>
    </li>
  );
}

export default EditableCard;
