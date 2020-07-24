import { Constants } from '../commons/CommonConstants';
import { IGameUI } from '../commons/CommonTypes';
import GameInputManager from '../input/GameInputManager';
import { mandatory } from '../utils/GameUtils';
import { GamePhaseType } from './GamePhaseTypes';

/**
 * State machine in charge of keeping track
 * of phases in the game, and is in charge of making phase
 * transitions from one phase to another.
 *
 * It keeps phases in a stack to keep track of states
 * that have been previously visited.
 *
 * For more, search for FSM (finite state machine).
 */
export default class GamePhaseManager {
  public phaseMap: Map<GamePhaseType, IGameUI>;
  private phaseStack: GamePhaseType[];
  private inputManager: GameInputManager | undefined;
  private phaseTransitionCallback: (newPhase: GamePhaseType) => Promise<boolean> | void;

  constructor(phaseMap: Map<GamePhaseType, IGameUI>, inputManager: GameInputManager) {
    this.phaseStack = [GamePhaseType.None];
    this.phaseMap = phaseMap;
    this.inputManager = inputManager;
    this.phaseTransitionCallback = Constants.nullFunction;
  }

  public addPhaseToMap(gamePhaseType: GamePhaseType, gameUI: IGameUI) {
    this.phaseMap.set(gamePhaseType, gameUI);
  }

  /**
   * Set the callback of the phase manager. The callback will be executed
   * before every phase transition. The function signature must accept a
   * GamePhaseType and returns a boolean.
   *
   * @param fn callback
   */
  public setCallback(fn: (newPhase: GamePhaseType) => Promise<boolean>) {
    this.phaseTransitionCallback = fn;
  }

  /**
   * Pop the current phase, and revert to the previous phase.
   * The current phase will no longer be saved on the phase stack.
   */
  public async popPhase(): Promise<void> {
    const prevPhase = this.phaseStack.pop()!;
    await this.executePhaseTransition(prevPhase, this.getCurrentPhase());
  }

  /**
   * Push a new phase; will cause previous phase to transition out
   * and transition in the new phase. Previous phase will be stored within
   * the phase stack.
   *
   * @param newPhase phase to transition to
   */
  public async pushPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase || this.isCurrentPhase(GamePhaseType.EscapeMenu)) return;
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  /**
   * Swap the previous phase to another phase. Previous phase will no
   * longer be saved on the phase stack.
   *
   * @param newPhase phase to swap to
   */
  public async swapPhase(newPhase: GamePhaseType): Promise<void> {
    const prevPhase = this.getCurrentPhase();
    if (newPhase === prevPhase || this.isCurrentPhase(GamePhaseType.EscapeMenu)) return;
    this.phaseStack.pop();
    this.phaseStack.push(newPhase);
    await this.executePhaseTransition(prevPhase, newPhase);
  }

  /**
   * Handles the transition from one phase to another,
   * by deactivating the previous phase followed by activating the new phase.
   *
   * During transition, all inputs are disabled (mouse and keyboard) to prevent
   * user input which may mutate the phase stack during the transition.
   *
   * Mutating the stack during the transition leads to phaseStack not matching
   * with what is shown on user screen; which leads to undefined behaviour.
   *
   * @param prevPhase previous phase to deactivate
   * @param newPhase new phase to activate
   */
  private async executePhaseTransition(prevPhase: GamePhaseType, newPhase: GamePhaseType) {
    // Disable inputs to avoid user input mutating the stack
    this.getInputManager().enableKeyboardInput(false);
    this.getInputManager().enableMouseInput(false);
    await this.phaseMap.get(prevPhase)!.deactivateUI();

    // Execute phase transition callback.
    // If executed, we no longer do transition to the new phase.
    if (await this.phaseTransitionCallback(newPhase)) {
      this.getInputManager().enableMouseInput(true);
      this.getInputManager().enableKeyboardInput(true);
      return;
    }

    // Transition to new phase
    await this.phaseMap.get(newPhase)!.activateUI();
    this.getInputManager().enableMouseInput(true);
    this.getInputManager().enableKeyboardInput(true);
  }

  /**
   * Checks whether the current phase is equal to the inquired phase
   *
   * @param phase phase to compare to
   * @returns {boolean}
   */
  public isCurrentPhase(phase: GamePhaseType): boolean {
    return this.getCurrentPhase() === phase;
  }

  /**
   * Returns the current phase.
   * If there is no phase, by default we return GamePhaseType.None.
   *
   * @return {GamePhaseType}
   */
  public getCurrentPhase(): GamePhaseType {
    if (!this.phaseStack.length) {
      this.phaseStack = [GamePhaseType.None];
    }
    return this.phaseStack[this.phaseStack.length - 1];
  }

  public getInputManager = () => mandatory(this.inputManager);
}
