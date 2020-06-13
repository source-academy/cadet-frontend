import { GameChapter } from 'src/features/game/chapter/GameChapterTypes';
import GameMap from 'src/features/game/location/GameMap';
import { GameLocation } from 'src/features/game/location/GameMapTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';
import LocationSelectChapter from '../../../../features/game/scenes/LocationSelectChapter';
import GameActionManager from '../../../../features/game/action/GameActionManager';
import GameModeManager from 'src/features/game/mode/GameModeManager';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/utils/LoadingScreen';
import Parser from 'src/features/game/parser/Parser';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import { screenSize, screenCenter } from 'src/features/game/commons/CommonConstants';
import commonAssets from 'src/features/game/commons/CommonAssets';

const { Image } = Phaser.GameObjects;
type GameManagerProps = {
  fileName: string;
};

class GameManager extends Phaser.Scene {
  public currentChapter: GameChapter;

  // Limited to current chapter
  public modeManager: GameModeManager;
  public layerManager: GameLayerManager;
  public stateManager: GameStateManager;
  public objectManager: GameObjectManager;
  // public dialogueManager: GameDialogueManager;
  public characterManager: GameCharacterManager;

  // Limited to current location
  public currentLocationName: string;
  private currentActiveMode: GameMode;

  constructor() {
    super('GameManager');

    this.currentChapter = LocationSelectChapter;
    this.currentLocationName = this.currentChapter.startingLoc;

    this.modeManager = new GameModeManager();
    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    // this.dialogueManager = new GameDialogueManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();

    this.currentActiveMode = GameMode.Menu;

    GameActionManager.getInstance().setGameManager(this);
  }

  init({ fileName }: GameManagerProps) {
    const text = this.cache.text.get(fileName);
    this.currentChapter = Parser.parse(text);
  }

  public preload() {
    addLoadingScreen(this);
    this.preloadLocationsAssets(this.currentChapter);
    this.preloadBaseAssets();

    this.modeManager.processModes(this.currentChapter);
    this.layerManager.initialiseMainLayer(this);
    this.stateManager.processChapter(this.currentChapter);
    this.objectManager.processObjects(this.currentChapter);
  }

  public create() {
    this.changeLocationTo(this.currentChapter.startingLoc);
  }

  private preloadBaseAssets() {
    commonAssets.forEach(asset => {
      this.load.image(asset.key, asset.path);
    });
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  private preloadLocationsAssets(chapter: GameChapter) {
    chapter.map.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, assetPath);
    });
  }

  private async renderLocation(map: GameMap, location: GameLocation) {
    this.layerManager.clearSeveralLayers([Layer.Background, Layer.Objects]);

    // Render background of the location
    const backgroundAsset = new Image(
      this,
      screenCenter.x,
      screenCenter.y,
      location.assetKey
    ).setDisplaySize(screenSize.x, screenSize.y);
    this.layerManager.addToLayer(Layer.Background, backgroundAsset);

    // Render objects in the location
    const objectLayerContainer = this.objectManager.getObjectsLayerContainer(location.name);
    this.layerManager.addToLayer(Layer.Objects, objectLayerContainer);

    // By default, activate Menu mode
    this.changeModeTo(GameMode.Menu, true, true);
  }

  public async changeLocationTo(locationName: string) {
    const location = this.currentChapter.map.getLocation(locationName);
    if (location) {
      // Deactive current UI of previous location
      this.deactivateCurrentUI();

      // Clear layers;

      // Update location
      this.currentLocationName = locationName;

      // Render new location
      await blackFade(this, 300, 300, () => this.renderLocation(this.currentChapter.map, location));

      // Update state after location is fully rendered
      this.stateManager.triggerInteraction(locationName);
    }
  }

  //////////////////////
  //   Mode Callback  //
  //////////////////////

  private deactivateCurrentUI() {
    const prevLocationMode = this.modeManager.getLocationMode(
      this.currentActiveMode,
      this.currentLocationName
    );

    if (prevLocationMode) {
      prevLocationMode.deactivateUI();
    }
  }

  public changeModeTo(newMode: GameMode, refresh?: boolean, skipDeactivate?: boolean) {
    if (!refresh && this.currentActiveMode === newMode) {
      return;
    }

    const locationMode = this.modeManager.getLocationMode(newMode, this.currentLocationName);

    if (locationMode) {
      if (!skipDeactivate) {
        this.deactivateCurrentUI();
      }

      // Activate new UI
      locationMode.activateUI();
      this.currentActiveMode = newMode;
    }
  }
}

export default GameManager;
