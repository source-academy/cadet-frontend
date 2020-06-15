import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ItemId } from '../../commons/CommonsTypes';
import {
  magnifyingGlass,
  magnifyingGlassChecked,
  magnifyingGlassHighlight
} from './GameModeExploreConstants';
import { getBackToMenuContainer } from '../GameModeHelper';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { screenSize } from '../../commons/CommonConstants';
import { sleep } from '../../utils/GameUtils';
import { LocationId } from '../../location/GameMapTypes';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private locationId: LocationId;

  constructor(locationId: LocationId) {
    this.uiContainer = undefined;
    this.locationId = locationId;
  }

  // Explore Mode does not require states
  public fetchLatestState(): void {}

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    exploreMenuContainer.add(getBackToMenuContainer());

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    // Attach container
    if (!this.uiContainer) {
      this.uiContainer = await this.getUIContainer();
      gameManager.add.existing(this.uiContainer);
    }

    if (this.uiContainer) {
      this.uiContainer.setActive(true);
      this.uiContainer.setVisible(true);
      this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...entryTweenProps
      });
    }

    this.attachExploreModeCallbacks();
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    gameManager.input.setDefaultCursor('');
    this.removeExploreModeCallbacks();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
    }
  }

  private attachExploreModeCallbacks() {
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER,
      this.explorePointerOver
    );
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT,
      this.explorePointerOut
    );
    GameActionManager.getInstance().addInteractiveObjectsListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
      this.explorePointerUp
    );
  }

  private removeExploreModeCallbacks() {
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OVER
    );
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_OUT
    );
    GameActionManager.getInstance().removeInteractiveObjectListeners(
      this.locationId,
      Phaser.Input.Events.GAMEOBJECT_POINTER_UP
    );
  }

  private explorePointerOver(id: ItemId) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const hasTriggered = GameActionManager.getInstance().hasTriggeredInteraction(id);
    if (hasTriggered) {
      gameManager.input.setDefaultCursor(magnifyingGlassChecked);
    } else {
      gameManager.input.setDefaultCursor(magnifyingGlassHighlight);
    }
  }

  private explorePointerOut() {
    const gameManager = GameActionManager.getInstance().getGameManager();
    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  private async explorePointerUp(id: string) {
    // Trigger action here
    GameActionManager.getInstance().triggerInteraction(id);
  }
}

export default GameModeExplore;
