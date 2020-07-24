import { Context, runInContext } from 'js-slang';
import { createContext } from 'src/commons/utils/JsSlangHelper';

import ImageAssets from '../../assets/ImageAssets';
import { getAwardProp } from '../../awards/GameAwardsHelper';
import GameAwardsManager from '../../awards/GameAwardsManager';
import { Constants, screenSize } from '../../commons/CommonConstants';
import { ItemId } from '../../commons/CommonTypes';
import { addLoadingScreen } from '../../effects/LoadingScreen';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GameInputManager from '../../input/GameInputManager';
import GameLayerManager from '../../layer/GameLayerManager';
import { Layer } from '../../layer/GameLayerTypes';
import GamePhaseManager from '../../phase/GamePhaseManager';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import SourceAcademyGame from '../../SourceAcademyGame';
import { mandatory } from '../../utils/GameUtils';
import { loadImage, loadSound } from '../../utils/LoaderUtils';
import { roomDefaultCode } from './RoomPreviewConstants';
import { createCMRGamePhases, createVerifiedHoverContainer } from './RoomPreviewHelper';

/**
 * This scene uses the students code as part of its code.
 *
 * Additionally, the scene shares some common functionality as
 * GameManager, in that it incorporates escape menu and collectible
 * menu.
 */
export default class RoomPreview extends Phaser.Scene {
  private layerManager?: GameLayerManager;
  private inputManager?: GameInputManager;
  private phaseManager?: GamePhaseManager;

  private studentCode: string;
  private preloadImageMap: Map<string, string>;
  private preloadSoundMap: Map<string, string>;

  private verifCont: Phaser.GameObjects.Container | undefined;
  private verifMask: Phaser.GameObjects.Graphics | undefined;

  private context?: Context;

  constructor() {
    super('RoomPreview');
    this.preloadImageMap = new Map<string, string>();
    this.preloadSoundMap = new Map<string, string>();
    this.studentCode = roomDefaultCode;
  }

  public init() {
    SourceAcademyGame.getInstance().setCurrentSceneRef(this);
    this.studentCode = SourceAcademyGame.getInstance().getRoomCode();
    this.layerManager = new GameLayerManager(this);
    this.inputManager = new GameInputManager(this);
    this.phaseManager = new GamePhaseManager(createCMRGamePhases(), this.inputManager);
    new GameEscapeManager(this);
    new GameAwardsManager(this);
    this.createContext();
  }

  public preload() {
    addLoadingScreen(this);
    this.bindKeyboardTriggers();

    // Initialise one verified tag to be used throughout the CMR
    const [verifCont, verifMask] = createVerifiedHoverContainer(this);
    this.verifCont = verifCont as Phaser.GameObjects.Container;
    this.verifMask = verifMask as Phaser.GameObjects.Graphics;
  }

  public async create() {
    // Run student code once to update the context
    await this.eval(this.studentCode);

    /**
     * We don't use .eval('preload();') at preload() as
     * .eval() is not awaited by the preload() method i.e. it does not
     * wait for student's preload function to finish.
     *
     * Instead, the students' 'preload()' function simply populate a map
     * of assets key and path to be loaded.
     *
     * We await the students .eval('preload();') at create()
     * to ensure that the .eval('preload();') is fully resolved.
     */
    await this.eval(`preload();`);

    // Preload all necessary assets
    await Promise.all(
      Array.from(this.preloadImageMap).map(async ([key, path]) => {
        await loadImage(this, key, path);
      })
    );
    await Promise.all(
      Array.from(this.preloadSoundMap).map(async ([key, path]) => {
        await loadSound(this, key, path);
      })
    );

    // Execute create
    await this.eval(`create();`);
    SourceAcademyGame.getInstance().getSoundManager().playBgMusic(Constants.nullInteractionId);

    // Add verified tag
    this.getLayerManager().addToLayer(Layer.UI, this.getVerifCont());
  }

  public update() {
    this.eval(`update();`);
  }

  public createContext() {
    this.context = createContext(4, [], {}, 'gpu', {
      scene: this,
      phaser: Phaser,
      preloadImageMap: this.preloadImageMap,
      preloadSoundMap: this.preloadSoundMap,
      layerManager: this.layerManager,
      layerTypes: Layer,
      remotePath: Constants.assetsFolder,
      screenSize: screenSize,
      createAward: (x: number, y: number, key: ItemId) => this.createAward(x, y, key)
    });
    this.context.externalContext = 'playground';
  }

  private async eval(code: string) {
    // runInContext also automatically updates the context
    await runInContext(code, this.context!);
  }

  /**
   * Bind the escape menu and awards menu to keyboard keys.
   */
  private bindKeyboardTriggers() {
    // Bind escape menu
    this.getInputManager().registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.ESC,
      'up',
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await this.getPhaseManager().popPhase();
        } else {
          await this.getPhaseManager().pushPhase(GamePhaseType.EscapeMenu);
        }
      }
    );
    // Bind collectible menu
    this.getInputManager().registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.TAB,
      'up',
      async () => {
        if (this.getPhaseManager().isCurrentPhase(GamePhaseType.AwardMenu)) {
          await this.getPhaseManager().popPhase();
        } else {
          await this.getPhaseManager().pushPhase(GamePhaseType.AwardMenu);
        }
      }
    );
  }

  /**
   * Clean up on related managers
   */
  public cleanUp() {
    this.getInputManager().clearListeners();
    this.getLayerManager().clearAllLayers();
  }

  /**
   * Create an award based on the given award key.
   * The award key is associated with an awardProperty,
   * which in turn will be used as the source of information for
   * the award.
   *
   * If the award is a valid key and the student already has
   * the award, the resulting object will have a verification
   * tag that pops up when student hovers over it.
   *
   * Else, we return a default image of a cookie; without
   * the verification tag.
   *
   * @param x x position of the award
   * @param y y position of the award
   * @param awardKey key associated with the award
   */
  private createAward(x: number, y: number, awardKey: ItemId) {
    const achievements = this.getUserStateManager().getAchievements();
    const collectibles = this.getUserStateManager().getCollectibles();
    if (achievements.includes(awardKey) || collectibles.includes(awardKey)) {
      const awardProp = getAwardProp(awardKey);
      const award = new Phaser.GameObjects.Sprite(this, x, y, awardProp.assetKey);
      return this.attachVerificationTag(award);
    }
    return new Phaser.GameObjects.Sprite(this, x, y, ImageAssets.cookies.key);
  }

  /**
   * Attach a verification tag to the sprite.
   * When user hovers on the sprite, a verification will appear
   * on the image.
   *
   * Used to verify autheticity of the award.
   *
   * @param sprite sprite to attach the verification tag to
   */
  private attachVerificationTag(sprite: Phaser.GameObjects.Sprite) {
    const verifCont = this.getVerifCont();
    const verifMask = this.getVerifMask();

    sprite.setInteractive({ pixelPerfect: true, useHandCursor: true });
    sprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
      verifCont.setVisible(true)
    );
    sprite.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
      verifCont.setVisible(false)
    );
    sprite.addListener(
      Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE,
      (pointer: Phaser.Input.Pointer) => {
        verifCont.x = pointer.x + 10;
        verifCont.y = pointer.y - 10;
        verifMask.x = pointer.x + 10;
        verifMask.y = pointer.y - 10;
      }
    );
    return sprite;
  }

  private getVerifCont = () => mandatory(this.verifCont);
  private getVerifMask = () => mandatory(this.verifMask);

  private getUserStateManager = () => SourceAcademyGame.getInstance().getUserStateManager();
  public getInputManager = () => mandatory(this.inputManager);
  public getLayerManager = () => mandatory(this.layerManager);
  public getPhaseManager = () => mandatory(this.phaseManager);
}
