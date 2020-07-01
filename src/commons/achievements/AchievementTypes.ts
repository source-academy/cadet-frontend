import { IconName } from '@blueprintjs/core';

export const UPDATE_ACHIEVEMENTS = 'UPDATE_ACHIEVEMENTS';
export const SAVE_ACHIEVEMENTS = 'SAVE_ACHIEVEMENTS';
export const GET_ACHIEVEMENTS = 'GET_ACHIEVEMENTS';
export const EDIT_ACHIEVEMENT = 'EDIT_ACHIEVEMENT';

// TODO: Rename abilities
export enum AchievementAbility {
  ACADEMIC = 'Academic',
  COMMUNITY = 'Community',
  EFFORT = 'Effort',
  EXPLORATION = 'Exploration'
}

export const achievementAbilities = [
  AchievementAbility.ACADEMIC,
  AchievementAbility.COMMUNITY,
  AchievementAbility.EFFORT,
  AchievementAbility.EXPLORATION
];

export enum AchievementStatus {
  ACTIVE = 'ACTIVE', // deadline not over and not completed
  COMPLETED = 'COMPLETED', // completed, regardless of deadline
  EXPIRED = 'EXPIRED' // deadline over and not completed
}

export enum FilterStatus {
  ALL = 'ALL', // show all achievements
  ACTIVE = 'ACTIVE', // show active achievements only
  COMPLETED = 'COMPLETED' // show completed achievements only
}

/**
 * Information of an achievement item
 *
 * @param {number} id unique id, primary key of the achievement item
 * @param {string} title title of the achievement item
 * @param {AchievementAbility} ability ability of the achievement item
 * @param {IconName} icon Optional, icon of the achievement item, to be replaced by image
 * @param {number} exp amount of exp that the achievement item grants
 * @param {Date} deadline Optional, the deadline of the achievement item
 * @param {Date} release Optional, the release date of the achievement item
 * @param {boolean} isTask the achievement item is rendered as an achievement task if true
 * @param {number[]} prerequisiteIds an array of the prerequisites id
 * @param {number} completionGoal achievement is marked as complete if
 *    user's completionProgress >= completionGoal
 * @param {number} completionProgress achievement is marked as complete if
 * @param {AchievementModalItem} modal modal item of the achievement
 * @param {number} position ordering position of the achievement, value is 0 for non-tasks
 */
export type AchievementItem = {
  id: number;
  title: string;
  ability: AchievementAbility;
  icon?: IconName;
  exp: number;
  deadline?: Date;
  release?: Date;
  isTask: boolean;
  prerequisiteIds: number[];
  completionGoal: number;
  completionProgress: number;
  modal: AchievementModalItem;
  position: number;
};

/**
 * Information of an achievement in a modal
 *
 * @param {string} modalImageUrl URL of the modal image
 * @param {string} description fixed text that displays under title
 * @param {string} goal describes the achievement requirement
 * @param {string} completionText text that displays after student completes the achievement
 */
export type AchievementModalItem = {
  modalImageUrl: string;
  description: string;
  goalText: string;
  completionText: string;
};

export type AchievementState = {
  achievements: AchievementItem[];
};

export const defaultAchievements: AchievementState = {
  achievements: []
};
