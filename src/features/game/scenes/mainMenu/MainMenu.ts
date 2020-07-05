import { mainMenuAssets, mainMenuOptBanner } from './MainMenuAssets';
import { studentRoomImg } from '../../location/GameMapConstants';
import { screenCenter, screenSize, Constants } from '../../commons/CommonConstants';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import { GameButton } from '../../commons/CommonsTypes';
import {
  optionsText,
  mainMenuYSpace,
  mainMenuStyle,
  textXOffset,
  bannerHide,
  onFocusOptTween,
  outFocusOptTween
} from './MainMenuConstants';
import commonSoundAssets, {
  buttonHoverSound,
  galacticHarmonyBgMusic
} from '../../commons/CommonSoundAssets';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { loadData } from '../../save/GameSaveRequests';
import { mandatory } from '../../utils/GameUtils';

class MainMenu extends Phaser.Scene {
  private layerManager?: GameLayerManager;
  private soundManager?: GameSoundManager;
  private optionButtons: GameButton[];

  constructor() {
    super('MainMenu');

    this.optionButtons = [];
  }

  public preload() {
    this.preloadAssets();
    this.layerManager = new GameLayerManager(this);
    this.soundManager = new GameSoundManager(this, getSourceAcademyGame());
    this.getSoundManager().loadSounds(commonSoundAssets.concat([galacticHarmonyBgMusic]));
    this.createOptionButtons();
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    if (accountInfo.role === 'staff') {
      console.log('Staff do not have accounts');
      return;
    }
    this.renderBackground();
    this.renderOptionButtons();

    const fullSaveState = await loadData(accountInfo);
    this.getSoundManager().playBgMusic(
      galacticHarmonyBgMusic.key,
      fullSaveState.userState && fullSaveState.userState.settings.volume
    );
  }

  private preloadAssets() {
    mainMenuAssets.forEach(asset => this.load.image(asset.key, asset.path));
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.getLayerManager().addToLayer(Layer.Background, backgroundImg);
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);

    this.optionButtons.forEach(button => {
      const text = button.text || '';
      const style = button.style || {};
      const buttonText = new Phaser.GameObjects.Text(
        this,
        button.assetXPos,
        button.assetYPos,
        text,
        style
      )
        .setOrigin(1.0, 0.15)
        .setAlign('right');
      const buttonSprite = new Phaser.GameObjects.Sprite(
        this,
        screenCenter.x + bannerHide,
        button.assetYPos,
        button.assetKey
      ).setInteractive({ pixelPerfect: true, useHandCursor: true });

      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, button.onInteract);
      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.getSoundManager().playSound(buttonHoverSound.key);
        this.tweens.add({
          targets: buttonSprite,
          ...onFocusOptTween
        });
      });
      buttonSprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        this.tweens.add({
          targets: buttonSprite,
          ...outFocusOptTween
        });
      });
      optionsContainer.add(buttonSprite);
      optionsContainer.add(buttonText);
    });

    this.getLayerManager().addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButtons() {
    this.optionButtons = [];
    this.addOptionButton(
      optionsText.chapterSelect,
      () => {
        this.getLayerManager().clearAllLayers();
        this.scene.start('ChapterSelect');
      },
      Constants.nullInteractionId
    );
    this.addOptionButton(
      optionsText.studentRoom,
      () => {
        this.getLayerManager().clearAllLayers();
        this.scene.start('MyRoom');
      },
      Constants.nullInteractionId
    );
    this.addOptionButton(
      optionsText.settings,
      () => {
        this.getLayerManager().clearAllLayers();
        this.scene.start('Settings');
      },
      Constants.nullInteractionId
    );
  }

  private addOptionButton(name: string, callback: any, interactionId: string) {
    const newNumberOfButtons = this.optionButtons.length + 1;
    const partitionSize = mainMenuYSpace / newNumberOfButtons;

    const newYPos = (screenSize.y - mainMenuYSpace + partitionSize) / 2;

    // Rearrange existing buttons
    for (let i = 0; i < this.optionButtons.length; i++) {
      this.optionButtons[i] = {
        ...this.optionButtons[i],
        assetYPos: newYPos + i * partitionSize
      };
    }

    // Add the new button
    const newTalkButton: GameButton = {
      text: name,
      style: mainMenuStyle,
      assetKey: mainMenuOptBanner.key,
      assetXPos: screenSize.x - textXOffset,
      assetYPos: newYPos + this.optionButtons.length * partitionSize,
      isInteractive: true,
      onInteract: callback,
      interactionId: interactionId
    };

    // Update
    this.optionButtons.push(newTalkButton);
  }
  public getLayerManager = () => mandatory(this.layerManager) as GameLayerManager;
  public getSoundManager = () => mandatory(this.soundManager) as GameSoundManager;
}

export default MainMenu;
