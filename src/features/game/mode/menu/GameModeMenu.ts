import { GameButton, IGameUI } from '../../commons/CommonsTypes';
import {
  menuEntryTweenProps,
  menuExitTweenProps,
  modeButtonYPos,
  modeButtonStyle,
  modeBannerRect
} from './GameModeMenuConstants';
import { sleep } from '../../utils/GameUtils';
import { GameMode, gameModeToPhase } from '../GameModeTypes';
import { screenSize, Constants } from '../../commons/CommonConstants';
import { shortButton } from '../../commons/CommonAssets';
import { Layer } from '../../layer/GameLayerTypes';
import { GameLocationAttr } from '../../location/GameMapTypes';
import GameManager from '../../scenes/gameManager/GameManager';

class GameModeMenu implements IGameUI {
  private uiContainer: Phaser.GameObjects.Container | undefined;
  private gameButtons: GameButton[];
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.gameButtons = [];
  }

  private createGameButtons(modes?: GameMode[]) {
    if (modes) {
      // Refresh Buttons
      modes.sort().forEach(mode => {
        this.addModeButton(mode, () => {
          this.gameManager.getPhaseManager().pushPhase(gameModeToPhase[mode]);

          if (mode !== GameMode.Talk) {
            this.gameManager.getLayerManager().fadeOutLayer(Layer.Character, 300);
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
      style: modeButtonStyle,
      assetKey: shortButton.key,
      assetXPos: newXPos + this.gameButtons.length * partitionSize,
      assetYPos: modeButtonYPos,
      isInteractive: true,
      onInteract: callback,
      interactionId: Constants.nullInteractionId
    };

    // Update
    this.gameButtons.push(newModeButton);
  }

  public fetchLatestState(): void {
    const currLocId = this.gameManager.currentLocationId;
    let latestModesInLoc = this.gameManager.getStateManager().getLocationMode(currLocId);
    const talkTopics = this.gameManager
      .getStateManager()
      .getLocationAttr(GameLocationAttr.talkTopics, currLocId);
    if (talkTopics) {
      latestModesInLoc = latestModesInLoc.filter(mode => mode !== GameMode.Talk);
    }
    this.createGameButtons(latestModesInLoc);
  }

  public getUIContainer(): Phaser.GameObjects.Container {
    const gameManager = this.gameManager;
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
      const style = button.style ? button.style : {};
      const buttonText = new Phaser.GameObjects.Text(
        gameManager,
        button.assetXPos,
        button.assetYPos,
        text,
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
    const gameManager = this.gameManager;
    this.uiContainer = await this.getUIContainer();
    this.gameManager.getLayerManager().addToLayer(Layer.UI, this.uiContainer);

    this.uiContainer.setActive(true);
    this.uiContainer.setVisible(true);
    this.uiContainer.setPosition(this.uiContainer.x, screenSize.y);

    gameManager.tweens.add({
      targets: this.uiContainer,
      ...menuEntryTweenProps
    });
  }

  public async deactivateUI(): Promise<void> {
    if (this.uiContainer) {
      this.uiContainer.setPosition(this.uiContainer.x, 0);

      this.gameManager.tweens.add({
        targets: this.uiContainer,
        ...menuExitTweenProps
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
