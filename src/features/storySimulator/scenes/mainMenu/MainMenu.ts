import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import Parser from 'src/features/game/parser/Parser';
import mainMenuConstants, { mainMenuOptStyle } from './MainMenuConstants';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';
import { toS3Path } from 'src/features/game/utils/GameUtils';
import { StorySimState } from '../../StorySimulatorTypes';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import ImageAssets from 'src/features/game/assets/ImageAssets';
import SSImageAssets from '../../assets/ImageAssets';
import FontAssets from 'src/features/game/assets/FontAssets';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { createButton } from 'src/features/game/utils/ButtonUtils';
import { calcTableFormatPos } from 'src/features/game/utils/StyleUtils';
import SoundAssets from 'src/features/game/assets/SoundAssets';

class MainMenu extends Phaser.Scene {
  private soundManager: GameSoundManager;
  private layerManager: GameLayerManager;

  constructor() {
    super('StorySimulatorMenu');
    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
  }
  public init() {
    getStorySimulatorGame().setStorySimProps({ mainMenuRef: this });
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.initialise(this, getStorySimulatorGame());
  }

  public async preload() {
    addLoadingScreen(this);
    Object.entries(ImageAssets).forEach(asset =>
      this.load.image(asset[1].key, toS3Path(asset[1].path))
    );
    Object.entries(SSImageAssets).forEach(asset =>
      this.load.image(asset[1].key, toS3Path(asset[1].path))
    );
    Object.entries(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset[1].key, asset[1].pngPath, asset[1].fntPath)
    );
    this.soundManager.loadSoundAssetMap(SoundAssets);
  }

  public async create() {
    this.renderBackground();
    this.renderOptionButtons();
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = this.getOptionButtons();

    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      maxXSpace: mainMenuConstants.optButtonsXSpace,
      maxYSpace: mainMenuConstants.optButtonsYSpace,
      numItemLimit: mainMenuConstants.maxOptButtonsRow,
      redistributeLast: true
    });

    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptButton(
          button.text,
          buttonPositions[index][0],
          buttonPositions[index][1],
          button.callback
        )
      )
    );
    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private getOptionButtons() {
    return [
      {
        text: 'Object Placement',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.ObjectPlacement);
          this.layerManager.clearAllLayers();
          this.scene.start('ObjectPlacement');
        }
      },
      {
        text: 'Simulate Checkpoint',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.CheckpointSim);
        }
      },
      {
        text: 'Asset Uploader',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.AssetUploader);
        }
      },
      {
        text: 'Chapter Sequencer',
        callback: () => {
          getStorySimulatorGame().setStorySimState(StorySimState.ChapterSequence);
        }
      }
    ];
  }
  private createOptButton(text: string, xPos: number, yPos: number, callback: any) {
    return createButton(
      this,
      {
        assetKey: SSImageAssets.invertedButton.key,
        message: text,
        textConfig: { x: 0, y: 0, oriX: 0.5, oriY: 0.5 },
        bitMapTextStyle: mainMenuOptStyle,
        onUp: callback
      },
      this.soundManager
    ).setPosition(xPos, yPos);
  }

  public callGameManager() {
    const defaultChapterText =
      sessionStorage.getItem(mainMenuConstants.gameTxtStorageName.defaultChapter) || '';
    const checkpointTxt =
      sessionStorage.getItem(mainMenuConstants.gameTxtStorageName.checkpointTxt) || '';
    if (defaultChapterText === '' && checkpointTxt === '') {
      return;
    }
    this.layerManager.clearAllLayers();
    Parser.parse(defaultChapterText);
    if (checkpointTxt) {
      Parser.parse(checkpointTxt, true);
    }
    const gameCheckpoint = Parser.checkpoint;

    this.scene.start('GameManager', {
      isStorySimulator: true,
      fullSaveState: undefined,
      gameCheckpoint,
      continueGame: false,
      chapterNum: -1,
      checkpointNum: -1
    });
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      SSImageAssets.storySimBg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);
    const backgroundUnderlay = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      SSImageAssets.blueUnderlay.key
    ).setAlpha(0.5);
    this.layerManager.addToLayer(Layer.Background, backgroundImg);
    this.layerManager.addToLayer(Layer.Background, backgroundUnderlay);
  }
}

export default MainMenu;
