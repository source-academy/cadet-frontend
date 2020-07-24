import _ from 'lodash';
import Constants from 'src/commons/utils/Constants';

import SourceAcademyGame from '../SourceAcademyGame';
import { createEmptySaveState } from './GameSaveHelper';
import { FullSaveState } from './GameSaveTypes';

/**
 * This function saves data to the backend.
 * Currently saves the entire game data in the "collectibles" field
 * just because that is the format accepted by the backend
 *
 * TODO: Change backend endpoint to accept fullSaveState
 *
 * @param fullSaveState - the entire game data that needs to be saved, including game state and userstate
 */
export async function saveData(fullSaveState: FullSaveState) {
  if (SourceAcademyGame.getInstance().getAccountInfo().role !== 'student') {
    return;
  }

  const options = {
    method: 'PUT',
    headers: createHeaders(SourceAcademyGame.getInstance().getAccountInfo().accessToken),
    body: JSON.stringify({
      gameStates: {
        collectibles: fullSaveState,
        completed_quests: []
      }
    })
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/game_states/save`, options);
  if (resp && resp.ok) {
    return resp;
  }
  return;
}

/**
 * This function fetches data from the backend.
 * Currently saves the loaded game data from the "collectibles" field
 * just because that is the format stored by the backend
 *
 * TODO: Change backend endpoint to store fullSaveState
 */
export async function loadData(): Promise<FullSaveState> {
  const options = {
    method: 'GET',
    headers: createHeaders(SourceAcademyGame.getInstance().getAccountInfo().accessToken)
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/`, options);
  const message = await resp.text();
  const json = JSON.parse(message);

  const loadedData = json.gameStates.collectibles;
  return _.isEmpty(loadedData) ? createEmptySaveState() : loadedData;
}

/**
 * This function clears the entire game object from the database
 */
export async function clearData() {
  const options = {
    method: 'PUT',
    headers: createHeaders(SourceAcademyGame.getInstance().getAccountInfo().accessToken)
  };

  const resp = await fetch(`${Constants.backendUrl}/v1/user/game_states/clear`, options);

  if (resp && resp.ok) {
    alert('Game cleared!');
    return;
  }
}

/**
 * Format a header object.
 *
 * @param accessToken access token to be used
 */
function createHeaders(accessToken: string): Headers {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Content-Type', 'application/json');
  return headers;
}
