import { screenCenter, screenSize, Constants } from '../../commons/CommonConstants';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import mainMenuConstants, { mainMenuStyle } from './MainMenuConstants';
import GameSoundManager from 'src/features/game/sound/GameSoundManager';
import { getSourceAcademyGame } from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { loadData } from '../../save/GameSaveRequests';
import { toS3Path } from '../../utils/GameUtils';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import { getRoomPreviewCode } from '../roomPreview/RoomPreviewHelper';
import ImageAssets from '../../assets/ImageAssets';
import FontAssets from '../../assets/FontAssets';
import SoundAssets from '../../assets/SoundAssets';
import { createButton } from '../../utils/ButtonUtils';
import { calcTableFormatPos } from '../../utils/StyleUtils';

class MainMenu extends Phaser.Scene {
  private layerManager: GameLayerManager;
  private soundManager: GameSoundManager;
  private roomCode: string;

  constructor() {
    super('MainMenu');

    this.layerManager = new GameLayerManager();
    this.soundManager = new GameSoundManager();
    this.roomCode = Constants.nullInteractionId;
  }

  public preload() {
    this.preloadAssets();
    this.layerManager.initialiseMainLayer(this);
    this.soundManager.initialise(this, getSourceAcademyGame());
    this.soundManager.loadSoundAssetMap(SoundAssets);
    addLoadingScreen(this);
  }

  public async create() {
    const accountInfo = getSourceAcademyGame().getAccountInfo();
    if (accountInfo.role === 'staff') {
      console.log('Staff do not have accounts');
      return;
    }
    this.renderBackground();
    this.renderOptionButtons();

    this.roomCode = await getRoomPreviewCode(accountInfo);
    const fullSaveState = await loadData(accountInfo);
    const volume = fullSaveState.userState ? fullSaveState.userState.settings.volume : 1;
    this.soundManager.playBgMusic(SoundAssets.galacticHarmony.key, volume);
  }

  private preloadAssets() {
    Object.entries(ImageAssets).forEach(asset =>
      this.load.image(asset[1].key, toS3Path(asset[1].path))
    );
    Object.entries(FontAssets).forEach(asset =>
      this.load.bitmapFont(asset[1].key, asset[1].pngPath, asset[1].fntPath)
    );
  }

  private renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      ImageAssets.mainMenuBackground.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }

  private renderOptionButtons() {
    const optionsContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const buttons = this.getOptionButtons();

    const buttonPositions = calcTableFormatPos({
      numOfItems: buttons.length,
      maxYSpace: mainMenuConstants.buttonYSpace,
      numItemLimit: 1
    });

    optionsContainer.add(
      buttons.map((button, index) =>
        this.createOptionButton(
          button.text,
          buttonPositions[index][0] + mainMenuConstants.bannerHide,
          buttonPositions[index][1],
          button.callback
        )
      )
    );

    this.layerManager.addToLayer(Layer.UI, optionsContainer);
  }

  private createOptionButton(text: string, xPos: number, yPos: number, callback: any) {
    const tweenOnHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...mainMenuConstants.onFocusOptTween
      });
    };
    const tweenOffHover = (target: Phaser.GameObjects.Container) => {
      this.tweens.add({
        targets: target,
        ...mainMenuConstants.outFocusOptTween
      });
    };
    const optButton: Phaser.GameObjects.Container = createButton(
      this,
      {
        assetKey: ImageAssets.mainMenuOptBanner.key,
        message: text,
        textConfig: { x: mainMenuConstants.textXOffset, y: 0, oriX: 1.0, oriY: 0.1 },
        bitMapTextStyle: mainMenuStyle,
        onUp: callback,
        onHover: () => tweenOnHover(optButton),
        onOut: () => tweenOffHover(optButton),
        onHoverEffect: false
      },
      this.soundManager
    ).setPosition(xPos, yPos);
    return optButton;
  }

  private getOptionButtons() {
    return [
      {
        text: mainMenuConstants.optionsText.chapterSelect,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('ChapterSelect');
        }
      },
      {
        text: mainMenuConstants.optionsText.collectible,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('MyRoom');
        }
      },
      {
        text: mainMenuConstants.optionsText.studentRoom,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('RoomPreview', { studentCode: this.roomCode });
        }
      },
      {
        text: mainMenuConstants.optionsText.settings,
        callback: () => {
          this.layerManager.clearAllLayers();
          this.scene.start('Settings');
        }
      }
    ];
  }
}

export default MainMenu;
