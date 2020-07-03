import { UserState } from './GameStateTypes';
import { emptyUserState } from './GameStateConstants';
import GameManager from '../scenes/gameManager/GameManager';

export default class GameUserStateManager {
  private userState: UserState;

  constructor() {
    this.userState = emptyUserState;
  }

  public initialise(gameManager: GameManager) {
    this.userState = gameManager.saveManager.getLoadedUserState() || emptyUserState;
  }

  public addToList(listName: string, id: string): void {
    this.userState[listName].push(id);
  }

  public getList(listName: string): string[] {
    return this.userState[listName];
  }

  public doesIdExistInList(listName: string, id: string): boolean {
    return this.userState[listName].includes(id);
  }
}