import { GameButton, IGameUI } from '../../commons/CommonTypes';
import modeMenuConstants, { modeButtonStyle, modeBannerRect } from './GameModeMenuConstants';
import { sleep } from '../../utils/GameUtils';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { GameMode, gameModeToPhase } from '../GameModeTypes';
import { screenSize, Constants } from '../../commons/CommonConstants';
import { Layer } from '../../layer/GameLayerTypes';
import { GameLocationAttr } from '../../location/GameMapTypes';
import { createBitmapText } from '../../utils/TextUtils';
import ImageAssets from '../../assets/ImageAssets';

class GameModeMenu implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private gameButtons: GameButton[];

  constructor() {
    this.gameButtons = [];
  }

  private createGameButtons(modes?: GameMode[]) {
    if (modes) {
      // Refresh Buttons
      modes.sort().forEach(mode => {
        this.addModeButton(mode, () => {
          GameActionManager.getInstance().pushPhase(gameModeToPhase[mode]);

          if (mode !== GameMode.Talk) {
            GameActionManager.getInstance()
              .getGameManager()
              .layerManager.fadeOutLayer(Layer.Character, 300);
          }
        });
      });
    }
  }

  private addModeButton(modeName: GameMode, callback: any) {
    const newNumberOfButtons = this.gameButtons.length + 1;
    const partitionSize = screenSize.x / newNumberOfButtons;

    const newXPos = partitionSize / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.gameButtons.length; i++) {
      this.gameButtons[i] = {
        ...this.gameButtons[i],
        assetXPos: newXPos + i * partitionSize
      };
    }

    // Add the new button
    const newModeButton: GameButton = {
      text: modeName,
      bitmapStyle: modeButtonStyle,
      assetKey: ImageAssets.shortButton.key,
      assetXPos: newXPos + this.gameButtons.length * partitionSize,
      assetYPos: modeMenuConstants.modeButtonYPos,
      isInteractive: true,
      onInteract: callback,
      interactionId: Constants.nullInteractionId
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public fetchLatestState(): void {
    const currLocId = GameActionManager.getInstance().getCurrLocId();
    let latestModesInLoc = GameActionManager.getInstance().getModesByLocId(currLocId);
    const talkTopics = GameActionManager.getInstance().getLocationAttr(
      GameLocationAttr.talkTopics,
      currLocId
    );
    if (talkTopics.length === 0) {
      latestModesInLoc = latestModesInLoc.filter(mode => mode !== GameMode.Talk);
    }
    this.createGameButtons(latestModesInLoc);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const modeMenuContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);

    const modeBanner = new Phaser.GameObjects.Image(
      gameManager,
      modeBannerRect.assetXPos,
      modeBannerRect.assetYPos,
      modeBannerRect.assetKey
    );
    modeMenuContainer.add(modeBanner);

    this.gameButtons.forEach(button => {
      const buttonSprite = new Phaser.GameObjects.Sprite(
        gameManager,
        button.assetXPos,
        button.assetYPos,
        button.assetKey
      );

      if (button.isInteractive) {
        buttonSprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
        buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      }

      const text = button.text ? button.text : '';
      const style = button.bitmapStyle ? button.bitmapStyle : Constants.defaultFontStyle;
      const buttonText = createBitmapText(
        gameManager,
        text,
        button.assetXPos,
        button.assetYPos,
        style
      ).setOrigin(0.5, 0.25);

      modeMenuContainer.add(buttonSprite);
      modeMenuContainer.add(buttonText);
    });

    return modeMenuContainer;
  }

  public async activateUI(): Promise<void> {
    this.uiContainer = undefined;
    this.gameButtons = [];
    this.fetchLatestState();
    const gameManager = GameActionManager.getInstance().getGameManager();

    this.uiContainer = await this.getUIContainer();
    GameActionManager.getInstance().addContainerToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...modeMenuConstants.entryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    const gameManager = GameActionManager.getInstance().getGameManager();

    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      gameManager.tweens.add({
        targets: this.uiContainer,
        ...modeMenuConstants.exitTweenProps
      });

      await sleep(500);
      this.uiContainer.setVisible(false);
      this.uiContainer.setActive(false);
      this.uiContainer.destroy();
      this.uiContainer = undefined;
    }
  }
}

export default GameModeMenu;
