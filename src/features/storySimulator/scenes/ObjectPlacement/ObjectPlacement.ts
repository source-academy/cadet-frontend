import { screenCenter, screenSize } from 'src/features/game/commons/CommonConstants';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import storySimulatorAssets, {
  studentRoomImg,
  colorIcon,
  imageIcon,
  bboxIcon,
  handIcon,
  listIcon,
  eraseIcon
} from 'src/features/storySimulator/utils/StorySimulatorAssets';
import { ImageAsset, AssetKey, AssetPath } from 'src/features/game/commons/CommonsTypes';
import SSObjectManager from '../../objects/SSObjectManager';
import SSBBoxManager from '../../boundingBoxes/SSBBoxManager';
import CommonBackButton from 'src/features/game/commons/CommonBackButton';
import SSCursorMode from '../../cursorMode/SSCursorMode';
import { cursorModeXPos, cursorModeYPos } from './ObjectPlacementConstants';
import { CursorMode } from '../../cursorMode/SSCursorModeTypes';
import SSBackgroundManager from '../../background/SSBackgroundManager';
import SSLogManager from '../../logger/SSLogManager';
import SSTransformManager from '../../transform/SSTransformManager';

export default class ObjectPlacement extends Phaser.Scene {
  public layerManager: GameLayerManager;
  private transformManager: SSTransformManager;
  private cursorModes: SSCursorMode | undefined;
  private bboxManager: SSBBoxManager;
  private objectManager: SSObjectManager;
  private backgroundManager: SSBackgroundManager;
  private logManager: SSLogManager;

  private assetMap: Map<AssetKey, AssetPath>;
  private itemIdNumber: number;

  private keyboardListeners: Phaser.Input.Keyboard.Key[];
  private eventListeners: Phaser.Input.InputPlugin[];
  private openBracket: Phaser.Input.Keyboard.Key | undefined;
  private closedBracket: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super('ObjectPlacement');
    this.layerManager = new GameLayerManager();
    this.objectManager = new SSObjectManager();
    this.bboxManager = new SSBBoxManager();
    this.backgroundManager = new SSBackgroundManager();
    this.logManager = new SSLogManager();
    this.transformManager = new SSTransformManager();

    this.cursorModes = undefined;
    this.keyboardListeners = [];
    this.eventListeners = [];
    this.itemIdNumber = 0;
    this.assetMap = new Map<AssetKey, AssetPath>();
  }

  public init() {
    this.layerManager = new GameLayerManager();
    this.objectManager = new SSObjectManager();
    this.bboxManager = new SSBBoxManager();
    this.backgroundManager = new SSBackgroundManager();
    this.logManager = new SSLogManager();
    this.transformManager = new SSTransformManager();

    this.cursorModes = undefined;
    this.keyboardListeners = [];
    this.eventListeners = [];
    this.itemIdNumber = 0;
    this.assetMap = new Map<AssetKey, AssetPath>();
  }

  public async preload() {
    storySimulatorAssets.forEach((asset: ImageAsset) => this.load.image(asset.key, asset.path));
  }

  public registerKeyboardListeners(keyboardListener: Phaser.Input.Keyboard.Key[]) {
    this.keyboardListeners.concat(keyboardListener);
  }

  public registerEventListeners(eventListener: Phaser.Input.InputPlugin[]) {
    this.eventListeners.concat(eventListener);
  }

  public create() {
    this.layerManager.initialiseMainLayer(this);
    this.renderBackground();
    this.createUIButtons();
    this.backgroundManager.initialise(this);
    this.objectManager.initialise(this);
    this.bboxManager.initialise(this);
    this.transformManager.initialise(this);
    this.logManager.initialise(this);

    this.openBracket = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET);
    this.closedBracket = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET);
  }

  public update() {
    if (this.openBracket && this.openBracket.isDown) {
      this.transformManager.resizeActive(false);
    }
    if (this.closedBracket && this.closedBracket.isDown) {
      this.transformManager.resizeActive(true);
    }

    this.bboxManager.resizeWhileBeingDrawn(this);
  }

  private createUIButtons() {
    const uiContainer = new Phaser.GameObjects.Container(this, 0, 0);
    const backButton = new CommonBackButton(
      this,
      () => {
        this.cleanUp();
        this.scene.start('StorySimulatorMenu');
      },
      0,
      0
    );

    this.cursorModes = new SSCursorMode(this, cursorModeXPos, cursorModeYPos);
    this.populateCursorModes();

    uiContainer.add(this.cursorModes);
    uiContainer.add(backButton);

    this.layerManager.addToLayer(Layer.UI, uiContainer);
  }

  public renderBackground() {
    const backgroundImg = new Phaser.GameObjects.Image(
      this,
      screenCenter.x,
      screenCenter.y,
      studentRoomImg.key
    );
    backgroundImg.setDisplaySize(screenSize.x, screenSize.y);

    this.layerManager.addToLayer(Layer.Background, backgroundImg);
  }

  private populateCursorModes() {
    if (this.cursorModes) {
      // Change background
      this.cursorModes.addCursorMode(
        this,
        colorIcon.key,
        false,
        'Set background',
        async () => await this.backgroundManager.loadBackground()
      );

      // Add object
      this.cursorModes.addCursorMode(
        this,
        imageIcon.key,
        false,
        'Add selected object',
        async () => await this.objectManager.loadObject()
      );

      // Draw BBox
      this.cursorModes.addCursorMode(this, bboxIcon.key, true, 'Draw bounding boxes', () =>
        this.cursorModes!.setCursorMode(CursorMode.DrawBBox)
      );

      // Drag/Resize
      this.cursorModes.addCursorMode(this, handIcon.key, true, 'Drag or resize', () =>
        this.cursorModes!.setCursorMode(CursorMode.DragResizeObj)
      );

      // Print info
      this.cursorModes.addCursorMode(
        this,
        listIcon.key,
        false,
        'Print coordinates',
        () =>
          this.logManager.printDetailMap([
            this.backgroundManager,
            this.objectManager,
            this.bboxManager
          ]),
        () =>
          this.logManager.showDetailMap([
            ...this.objectManager.getLoggables(),
            ...this.bboxManager.getLoggables()
          ]),
        () => this.logManager.hideDetailMap()
      );

      // Erase Layers
      this.cursorModes.addCursorMode(this, eraseIcon.key, false, 'Erase all', () => {
        this.layerManager.clearSeveralLayers([Layer.Background, Layer.BBox, Layer.Objects]);
        this.objectManager.deleteAll();
        this.bboxManager.deleteAll();
        this.transformManager.deselect();
        this.renderBackground();
      });

      this.cursorModes.renderCursorModesContainer();
    }
  }

  public getCursorManager() {
    if (!this.cursorModes) {
      throw new Error('No cursor mode manager');
    }
    return this.cursorModes;
  }

  public getCoordinates(): number[] {
    return [this.input.x, this.input.y];
  }

  public isCursorMode(cursorMode: CursorMode) {
    return this.getCursorManager().getCurrCursorMode() === cursorMode;
  }

  private cleanUp() {
    this.keyboardListeners.forEach(keyboardListener => keyboardListener.removeAllListeners());
    this.eventListeners.forEach(eventListener => eventListener.removeAllListeners());
    this.layerManager.clearAllLayers();
  }

  public addAsset(assetKey: AssetKey, assetPath: AssetPath) {
    this.assetMap.set(assetKey, assetPath);
  }

  public getAssetPath(assetKey: AssetKey) {
    return this.assetMap.get(assetKey);
  }

  public generateItemIdNumber() {
    return this.itemIdNumber++;
  }

  public setActiveSelection(gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    this.transformManager.setActiveSelection(gameObject);
  }

  public setObjAttribute(
    objectSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    attribute: string,
    value: number
  ) {
    this.objectManager.setAttribute(objectSprite, attribute, value);
  }

  public deleteObj(objectSprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) {
    this.objectManager.delete(objectSprite);
  }

  public setBBoxAttribute(
    bboxSprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
    attribute: string,
    value: number
  ) {
    this.bboxManager.setAttribute(bboxSprite, attribute, value);
  }

  public deleteBBox(bboxSprite: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) {
    this.bboxManager.delete(bboxSprite);
  }
}