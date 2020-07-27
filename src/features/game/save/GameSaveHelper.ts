import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import SourceAcademyGame from '../SourceAcademyGame';
import { FullSaveState } from './GameSaveTypes';

/**
 * Function that saves game data as a 'snapshot' in FullSaveState
 * json format by collecting game data from game manager,
 * game state manager, user state manager, and phase manager
 *
 * @param prevGameState - the snapshot of the game the during the last save point
 * @param chapterNum - the chapterNumber of the game
 * @param checkpointNUm - the checkpoint of the game
 * @returns {FullSaveState} - the new 'snapshot' of the game
 */
export function gameStateToJson(
  prevGameState: FullSaveState,
  chapterNum: number,
  checkpointNum: number
): FullSaveState {
  const gameManager = GameGlobalAPI.getInstance().getGameManager();
  const gameStateManager = gameManager.getStateManager();
  const phaseManager = gameManager.getPhaseManager();

  return {
    gameSaveStates: {
      ...prevGameState.gameSaveStates,
      [chapterNum]: {
        lastCheckpointPlayed: checkpointNum,
        currentLocation: gameManager.currentLocationId,
        currentPhase: phaseManager.getCurrentPhase(),
        completedObjectives: gameStateManager.getCompletedObjectives(),
        triggeredInteractions: gameStateManager.getTriggeredInteractions(),
        triggeredActions: gameStateManager.getTriggeredActions()
      }
    },
    userSaveState: {
      settings: prevGameState.userSaveState.settings,
      recentlyPlayedCheckpoint: [chapterNum, checkpointNum],
      collectibles: SourceAcademyGame.getInstance().getUserStateManager().getCollectibles(),
      largestCompletedChapter: prevGameState.userSaveState.largestCompletedChapter
    }
  };
}

/**
 * Function to create an empty save state
 * Used for resetting game data of students
 *
 * @returns {FullSaveState} - an empty save state for starting players
 */
export const createEmptySaveState = (): FullSaveState => {
  return {
    gameSaveStates: {},
    userSaveState: {
      collectibles: [],
      settings: { bgmVolume: 1, sfxVolume: 1 },
      recentlyPlayedCheckpoint: [-1, -1],
      largestCompletedChapter: -1
    }
  };
};

/**
 * Converts a map, where some items have been triggered
 * into an array containing all the items that have been triggered.
 *
 * @param completionMap map containing string elements to boolean indicating
 *                      which elements have been completed/triggerd
 */
export function convertMapToArray(completionMap: Map<string, boolean>) {
  return Array.from(completionMap)
    .filter(([_objective, boolean]: [string, boolean]) => boolean)
    .map(([objective]: [string, boolean]) => objective);
}
