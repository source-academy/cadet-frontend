import { UserState } from './GameStateTypes';
import { SampleUserState, DefaultUserState } from './SampleUserState';

export default class GameUserStateManager {
  private userState: UserState;

  constructor() {
    this.userState = DefaultUserState;
  }

  public async initialise() {
    this.userState = await this.fetchUserStateJson();
  }

  private async fetchUserStateJson() {
    return SampleUserState;
  }

  private async sendUserStateJson() {}

  public addToList(listName: string, id: string): void {
    this.userState[listName].push(id);
    console.log(`Adding ${id} to ${listName}`);
    this.sendUserStateJson();
  }

  public getList(listName: string): void {
    return this.userState[listName];
  }

  public doesIdExistInList(listName: string, id: string): boolean {
    return this.userState[listName].includes(id);
  }
}
