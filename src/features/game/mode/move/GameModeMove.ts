import { IGameUI, GameSprite, GameButton } from '../../commons/CommonTypes';
import {
  previewFrameXPos,
  previewXPos,
  previewYPos,
  previewHeight,
  previewWidth,
  previewFill,
  previewFrame
} from './GameModeMoveConstants';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { sleep } from '../../utils/GameUtils';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { moveButtonYSpace, moveButtonStyle, moveButtonXPos } from './GameModeMoveConstants';
import { screenSize, Constants } from '../../commons/CommonConstants';
import { entryTweenProps, exitTweenProps } from '../../effects/FlyEffect';
import { Layer } from '../../layer/GameLayerTypes';
import CommonBackButton from '../../commons/CommonBackButton';
import { createBitmapText } from '../../utils/TextUtils';
import ImageAssets from '../../assets/ImageAssets';

class GameModeMove implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private currentLocationAssetKey: string;
  private locationAssetKeys: Map<string, string>;
  private previewFill: GameSprite;
  private previewFrame: GameSprite;
  private gameButtons: GameButton[];

  constructor() {
    this.uiContainer = undefined;
    this.currentLocationAssetKey = ImageAssets.defaultLocationImg.key;
    this.locationAssetKeys = new Map<string, string>();
    this.previewFill = previewFill;
    this.previewFrame = previewFrame;
    this.gameButtons = [];
  }

  private async createGameButtons(navigation: string[]) {
    // Refresh Buttons
    this.gameButtons = [];

    await navigation.forEach(locationId => {
      const location = GameActionManager.getInstance().getLocationAtId(locationId);
      if (location) {
        this.addMoveOptionButton(location.name, async () => {
          await GameActionManager.getInstance().popPhase();
          await GameActionManager.getInstance().changeLocationTo(location.id);
        });
        this.locationAssetKeys.set(location.name, location.assetKey);
      }
    });
  }

  private addMoveOptionButton(name: string, callback: any) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = moveButtonYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - moveButtonYSpace) / 2 + partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.gameButtons.length; i++) {
      this.gameButtons[i] = {
        ...this.gameButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: name,
      bitmapStyle: moveButtonStyle,
      assetKey: ImageAssets.longButton.key,
      assetXPos: moveButtonXPos,
      assetYPos: newYPos + this.gameButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: name
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public fetchLatestState(): void {
    const locationId = GameActionManager.getInstance().getCurrLocId();
    const latestLocationNav = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.navigation,
      locationId
    );
    if (!latestLocationNav) {
      return;
    }
    this.createGameButtons(latestLocationNav);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const moveMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const previewFrame = new Phaser.GameObjects.Image(
      gameManager,
      previewFrameXPos,
      this.previewFrame.assetYPos,
      this.previewFrame.assetKey
    );
    moveMenuContainer.add(previewFrame);

    const previewFill = new Phaser.GameObjects.Sprite(
      gameManager,
      this.previewFill.assetXPos,
      this.previewFill.assetYPos,
      this.previewFill.assetKey
    );

    this.setPreview(previewFill, this.currentLocationAssetKey);
    moveMenuContainer.add(previewFill);

    this.gameButtons.forEach(locationButton => {
      const text = locationButton.text ? locationButton.text : '';
      const style = locationButton.bitmapStyle
        ? locationButton.bitmapStyle
        : Constants.defaultFontStyle;
      const locationButtonText = createBitmapText(
        gameManager,
        text,
        locationButton.assetXPos,
        locationButton.assetYPos,
        style
      ).setOrigin(0.4, 0.15);

      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        locationButton.assetXPos,
        locationButton.assetYPos,
        locationButton.assetKey
      );

      if (locationButton.isInteractive) {
        buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
        buttonSprite.addListener(
          Phaser.Input.Events.GAMEOBJECT_POINTER_UP,
          locationButton.onInteract
        );
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
          // Preview location
          const assetKey = this.locationAssetKeys.get(text);
          if (!assetKey || this.currentLocationAssetKey === assetKey) {
            return;
          }
          this.setPreview(previewFill, assetKey);
        });
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
          // Reset preview
          this.setPreview(previewFill, ImageAssets.defaultLocationImg.key);
        });
      }

      moveMenuContainer.add(buttonSprite);
      moveMenuContainer.add(locationButtonText);
    });

    // Add back button
    const backButton = new CommonBackButton(
      gameManager,
      () => {
        GameActionManager.getInstance().popPhase();
        GameActionManager.getInstance()
          .getGameManager()
          .layerManager.fadeInLayer(Layer.Character, 300);
      },
      0,
      0
    );
    moveMenuContainer.add(backButton);
    return moveMenuContainer;
  }

  private setPreview(sprite: Phaser.GameObjects.Sprite, assetKey: string) {
    sprite
      .setTexture(assetKey)
      .setDisplaySize(previewWidth, previewHeight)
      .setPosition(previewXPos, previewYPos);

    // Update
    this.currentLocationAssetKey = assetKey;
  }

  public async activateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.fetchLatestState();
    this.uiContainer = await this.getUIContainer();
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, -screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...exitTweenProps
      });

      await sleep(500);
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
      this.uiContainer.destroy();
      this.uiContainer = undefined;
    }
  }
}

export default GameModeMove;
