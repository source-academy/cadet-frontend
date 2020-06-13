import GameActionManager from 'src/features/game/action/GameActionManager';
import { IGameUI, ItemId } from '../../commons/CommonsTypes';
import { ObjectProperty } from '../../objects/GameObjectTypes';
import { BBoxProperty } from '../../boundingBoxes/BoundingBoxTypes';
import { magnifyingGlass } from './GameModeExploreConstants';
import { getBackToMenuContainer } from '../GameModeHelper';
import { GameLocationAttr } from '../../location/GameMapTypes';

class GameModeExplore implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private locationName: string;
  private bboxIds: ItemId[];
  private boundingBoxes: Map<ItemId, BBoxProperty>;

  constructor(
    locationName: string,
    objectIds?: ItemId[],
    bboxIds?: ItemId[],
    objects?: Map<ItemId, ObjectProperty>,
    boundingBoxes?: Map<ItemId, BBoxProperty>
  ) {
    this.uiContainer = undefined;
    this.locationName = locationName;
    this.boundingBoxes = boundingBoxes || new Map<ItemId, BBoxProperty>();
    this.bboxIds = bboxIds || [];
  }

  public fetchLatestState(): void {
    const latestBBoxIds = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.boundingBoxes,
      this.locationName
    );
    if (!latestBBoxIds) {
      return;
    }
    this.bboxIds = latestBBoxIds;
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('GetUIContainer: Game Manager is not defined!');
    }

    const exploreMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    // Register boundingBoxes
    this.bboxIds.forEach(bboxId => {
      const bbox = this.boundingBoxes.get(bboxId);
      if (bbox) {
        const newBBox = new Phaser.GameObjects.Rectangle(
          gameManager,
          bbox.x,
          bbox.y,
          bbox.width,
          bbox.height,
          0,
          0
        );
        exploreMenuContainer.add(newBBox);
      }
    });

    exploreMenuContainer.add(getBackToMenuContainer());

    return exploreMenuContainer;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('ActivateUI: Game Manager is not defined!');
    }

    // Fetch latest state if location is not yet visited
    const hasUpdates = GameActionManager.getInstance().hasLocationUpdate(this.locationName);
    if (hasUpdates || !this.uiContainer) {
      if (this.uiContainer) {
        this.uiContainer.destroy();
      }
      this.fetchLatestState();
      this.uiContainer = await this.getUIContainer();
      gameManager.add.existing(this.uiContainer);
    }

    if (this.uiContainer) {
      this.uiContainer.setActive(true);
      this.uiContainer.setVisible(true);
    }

    gameManager.input.setDefaultCursor(magnifyingGlass);
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      throw console.error('DeactivateUI: Game Manager is not defined!');
    }

    gameManager.input.setDefaultCursor('');

    if (this.uiContainer) {
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
    }
  }
}

export default GameModeExplore;
