import GameGlobalAPI from './GameGlobalAPI';
import GameLayerManager from 'src/features/game/layer/GameLayerManager';
import GameCharacterManager from 'src/features/game/character/GameCharacterManager';
import GameDialogueManager from 'src/features/game/dialogue/GameDialogueManager';
import GameStateManager from 'src/features/game/state/GameStateManager';
import GameObjectManager from 'src/features/game/objects/GameObjectManager';
import GameActionManager from 'src/features/game/action/GameActionManager';
import GameUserStateManager from 'src/features/game/state/GameUserStateManager';
import GameEscapeManager from '../../escape/GameEscapeManager';
import GamePhaseManager from '../../phase/GamePhaseManager';
import GameBBoxManager from 'src/features/game/boundingBoxes/GameBoundingBoxManager';
import GamePopUpManager from 'src/features/game/popUp/GamePopUpManager';
import GameSoundManager from '../../sound/GameSoundManager';
import GameSaveManager from '../../save/GameSaveManager';
import GameBackgroundManager from '../../background/GameBackgroundManager';
import GameInputManager from '../../input/GameInputManager';

import { GameCheckpoint } from 'src/features/game/chapter/GameChapterTypes';
import { LocationId } from 'src/features/game/location/GameMapTypes';
import { blackFade } from 'src/features/game/effects/FadeEffect';
import { addLoadingScreen } from 'src/features/game/effects/LoadingScreen';
import {
  getSourceAcademyGame,
  SourceAcademyGame,
  AccountInfo
} from 'src/pages/academy/game/subcomponents/sourceAcademyGame';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { FullSaveState } from '../../save/GameSaveTypes';
import { getStorySimulatorGame } from 'src/pages/academy/storySimulator/subcomponents/storySimulatorGame';
import { Layer } from '../../layer/GameLayerTypes';
import { toS3Path } from '../../utils/GameUtils';
import { Constants } from '../../commons/CommonConstants';
import { createGamePhases } from './GameManagerHelper';

type GameManagerProps = {
  fullSaveState: FullSaveState;
  gameCheckpoint: GameCheckpoint;
  continueGame: boolean;
  chapterNum: number;
  checkpointNum: number;
  isStorySimulator: boolean;
};

class GameManager extends Phaser.Scene {
  public currentLocationId: LocationId;
  public parentGame: SourceAcademyGame | undefined;
  public isStorySimulator: boolean;

  private currentCheckpoint: GameCheckpoint | undefined;
  private accountInfo: AccountInfo | undefined;
  private fullSaveState: FullSaveState | undefined;
  private continueGame: boolean;
  private chapterNum: number;
  private checkpointNum: number;

  public layerManager: GameLayerManager;
  public stateManager: GameStateManager;
  public objectManager: GameObjectManager;
  public characterManager: GameCharacterManager;
  public dialogueManager: GameDialogueManager;
  public actionManager: GameActionManager;
  public userStateManager: GameUserStateManager;
  public boundingBoxManager: GameBBoxManager;
  public popUpManager: GamePopUpManager;
  public saveManager: GameSaveManager;
  public soundManager: GameSoundManager;
  public escapeManager: GameEscapeManager;
  public phaseManager: GamePhaseManager;
  public backgroundManager: GameBackgroundManager;
  public inputManager: GameInputManager;

  constructor() {
    super('GameManager');
    this.currentCheckpoint = undefined;
    this.fullSaveState = undefined;
    this.continueGame = false;
    this.chapterNum = Constants.nullSequenceNumber;
    this.checkpointNum = Constants.nullSequenceNumber;
    this.currentLocationId = Constants.nullInteractionId;
    this.isStorySimulator = false;

    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionManager = new GameActionManager();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.saveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();
    this.inputManager = new GameInputManager();
  }

  public init({
    gameCheckpoint,
    fullSaveState,
    continueGame,
    chapterNum,
    checkpointNum,
    isStorySimulator
  }: GameManagerProps) {
    this.isStorySimulator = isStorySimulator;
    this.parentGame = isStorySimulator ? getStorySimulatorGame() : getSourceAcademyGame();
    this.currentCheckpoint = gameCheckpoint;
    this.fullSaveState = fullSaveState;
    this.continueGame = continueGame;
    this.chapterNum = chapterNum;
    this.checkpointNum = checkpointNum;
    this.initialiseManagers();
  }

  private initialiseManagers() {
    this.layerManager = new GameLayerManager();
    this.stateManager = new GameStateManager();
    this.characterManager = new GameCharacterManager();
    this.objectManager = new GameObjectManager();
    this.dialogueManager = new GameDialogueManager();
    this.actionManager = new GameActionManager();
    this.userStateManager = new GameUserStateManager();
    this.boundingBoxManager = new GameBBoxManager();
    this.popUpManager = new GamePopUpManager();
    this.saveManager = new GameSaveManager();
    this.soundManager = new GameSoundManager();
    this.escapeManager = new GameEscapeManager();
    this.phaseManager = new GamePhaseManager();
    this.backgroundManager = new GameBackgroundManager();
    this.inputManager = new GameInputManager();
  }

  //////////////////////
  //    Preload       //
  //////////////////////

  public preload() {
    GameGlobalAPI.getInstance().setGameManager(this);
    addLoadingScreen(this);
    this.loadGameState();

    this.currentLocationId =
      this.saveManager.getLoadedLocation() || this.getCurrentCheckpoint().startingLoc;
    this.stateManager.initialise(this);
    this.userStateManager.initialise(this);
    this.soundManager.initialise(this, this.parentGame || getSourceAcademyGame());
    this.dialogueManager.initialise(this);
    this.characterManager.initialise(this);
    this.actionManager.initialise(this);
    this.inputManager.initialise(this);
    this.boundingBoxManager.initialise();
    this.objectManager.initialise();
    this.layerManager.initialise(this);
    this.phaseManager.initialise(createGamePhases(this.escapeManager), this.inputManager);

    this.soundManager.loadSounds(this.getCurrentCheckpoint().map.getSoundAssets());
    this.phaseManager.setCallback(async () => await this.checkpointTransition());
    this.preloadLocationsAssets(this.getCurrentCheckpoint());
    this.bindKeyboardTriggers();
  }

  private loadGameState() {
    this.accountInfo = this.getParentGame().getAccountInfo();
    if (this.isStorySimulator && this.accountInfo.role === 'staff') {
      this.saveManager.initialiseForStaff(this.accountInfo);
    } else if (!this.isStorySimulator && this.accountInfo.role === 'student') {
      this.saveManager.initialiseForGame(
        this.accountInfo,
        this.fullSaveState,
        this.chapterNum,
        this.checkpointNum,
        this.continueGame
      );
    } else {
      throw new Error('Mismatch of roles');
    }
  }

  private preloadLocationsAssets(chapter: GameCheckpoint) {
    chapter.map.getMapAssets().forEach((assetPath, assetKey) => {
      this.load.image(assetKey, toS3Path(assetPath));
    });
  }

  //////////////////////
  // Location Helpers //
  //////////////////////

  public async create() {
    await this.userStateManager.loadAssessments();
    this.changeLocationTo(this.currentLocationId, true);
    await GameGlobalAPI.getInstance().saveGame();
  }

  private async renderLocation(locationId: LocationId, startAction: boolean) {
    const gameLocation = GameGlobalAPI.getInstance().getLocationAtId(locationId);
    await this.soundManager.renderBackgroundMusic(gameLocation.bgmKey);

    this.backgroundManager.renderBackgroundLayerContainer(locationId);
    this.objectManager.renderObjectsLayerContainer(locationId);
    this.boundingBoxManager.renderBBoxLayerContainer(locationId);
    this.characterManager.renderCharacterLayerContainer(locationId);
    this.layerManager.showLayer(Layer.Character);

    await this.phaseManager.swapPhase(GamePhaseType.Sequence);

    // Execute start actions, notif, then cutscene
    if (startAction) {
      await this.actionManager.processGameActions(
        this.getCurrentCheckpoint().map.getStartActions()
      );
    }

    if (!this.stateManager.hasTriggeredInteraction(locationId)) {
      await GameGlobalAPI.getInstance().bringUpUpdateNotif(gameLocation.name);
    }
    await this.actionManager.processGameActions(gameLocation.actionIds);

    await this.phaseManager.swapPhase(GamePhaseType.Menu);
  }

  public async changeLocationTo(locationId: LocationId, startAction: boolean = false) {
    this.currentLocationId = locationId;

    await blackFade(this, 300, 500, async () => {
      await this.layerManager.clearAllLayers();
      await this.renderLocation(locationId, startAction);
    });

    // Update state after location is fully rendered
    this.stateManager.triggerInteraction(locationId);
  }

  private bindKeyboardTriggers() {
    this.inputManager.registerKeyboardListener(
      Phaser.Input.Keyboard.KeyCodes.ESC,
      'up',
      async () => {
        if (this.phaseManager.isCurrentPhase(GamePhaseType.EscapeMenu)) {
          await this.phaseManager.popPhase();
        } else {
          await this.phaseManager.pushPhase(GamePhaseType.EscapeMenu);
        }
      }
    );
  }

  public cleanUp() {
    this.soundManager.stopCurrBgMusic();
    this.inputManager.clearListeners();
    this.layerManager.clearAllLayers();
  }

  public async checkpointTransition() {
    // Transition to the next scene if possible
    if (GameGlobalAPI.getInstance().isAllComplete()) {
      await this.actionManager.processGameActions(this.getCurrentCheckpoint().map.getEndActions());
      this.cleanUp();
      if (GameGlobalAPI.getInstance().isStorySimulator()) {
        this.scene.start('StorySimulatorMenu');
      } else {
        this.scene.start('CheckpointTransition');
      }
    }
  }

  private getParentGame() {
    if (!this.parentGame) {
      throw new Error('No parent game');
    }
    return this.parentGame;
  }

  public getCurrentCheckpoint() {
    if (!this.currentCheckpoint) {
      throw new Error('No loaded checkpoint');
    }
    return this.currentCheckpoint;
  }

  public getAccountInfo() {
    if (!this.accountInfo) {
      throw new Error('No account info');
    }
    return this.accountInfo;
  }
}

export default GameManager;
