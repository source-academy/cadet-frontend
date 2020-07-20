import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { GameMode } from 'src/features/game/mode/GameModeTypes';

import { BBoxProperty } from '../../boundingBoxes/GameBoundingBoxTypes';
import { GamePosition, ItemId } from '../../commons/CommonTypes';
import { AssetKey } from '../../commons/CommonTypes';
import { displayNotification } from '../../effects/Notification';
import { GameLocation, GameLocationAttr, LocationId } from '../../location/GameMapTypes';
import { ObjectProperty } from '../../objects/GameObjectTypes';
import { GamePhaseType } from '../../phase/GamePhaseTypes';
import { SettingsJson, UserSaveState } from '../../save/GameSaveTypes';
import { StateObserver } from '../../state/GameStateTypes';
import { mandatory } from '../../utils/GameUtils';
import GameManager from './GameManager';

class GameGlobalAPI {
  private gameManager: GameManager | undefined;

  static instance: GameGlobalAPI;

  private constructor() {
    this.gameManager = undefined;
  }

  static getInstance() {
    if (!GameGlobalAPI.instance) {
      GameGlobalAPI.instance = new GameGlobalAPI();
    }
    return GameGlobalAPI.instance;
  }

  /////////////////////
  //   Game Manager  //
  /////////////////////

  public getGameManager = () => mandatory(this.gameManager) as GameManager;

  public setGameManager(gameManagerRef: GameManager): void {
    this.gameManager = gameManagerRef;
  }

  public getCurrLocId(): LocationId {
    return this.getGameManager().currentLocationId;
  }

  public getLocationAtId(locationId: LocationId): GameLocation {
    return this.getGameManager().getCurrentCheckpoint().map.getLocationAtId(locationId);
  }

  public isStorySimulator() {
    return this.getGameManager().isStorySimulator;
  }

  public getAccountInfo() {
    return this.getGameManager().getAccountInfo();
  }

  /////////////////////
  //    Game Mode    //
  /////////////////////

  public getModesByLocId(locationId: LocationId): GameMode[] {
    return this.getGameManager().stateManager.getLocationMode(locationId);
  }

  public addLocationMode(locationId: LocationId, mode: GameMode): void {
    this.getGameManager().stateManager.addLocationMode(locationId, mode);
  }

  public removeLocationMode(locationId: LocationId, mode: GameMode): void {
    this.getGameManager().stateManager.removeLocationMode(locationId, mode);
  }

  /////////////////////
  //  Game Locations //
  /////////////////////

  public hasLocationUpdate(locationId: LocationId, mode?: GameMode): boolean | undefined {
    return this.getGameManager().stateManager.hasLocationUpdate(locationId, mode);
  }

  public changeLocationTo(locationName: string) {
    this.getGameManager().changeLocationTo(locationName);
  }

  /////////////////////
  //   Interaction   //
  /////////////////////

  public hasTriggeredInteraction(id: string): boolean | undefined {
    return this.getGameManager().stateManager.hasTriggeredInteraction(id);
  }

  public triggerInteraction(id: string): void {
    this.getGameManager().stateManager.triggerInteraction(id);
  }

  /////////////////////
  //    Game Attr    //
  /////////////////////

  public getLocationAttr(attr: GameLocationAttr, locationId: LocationId): ItemId[] {
    return this.getGameManager().stateManager.getLocationAttr(attr, locationId);
  }

  public addLocationAttr(attr: GameLocationAttr, locationId: LocationId, attrElem: string): void {
    this.getGameManager().stateManager.addLocationAttr(attr, locationId, attrElem);
  }

  public removeLocationAttr(
    attr: GameLocationAttr,
    locationId: LocationId,
    attrElem: string
  ): void {
    return this.getGameManager().stateManager.removeLocationAttr(attr, locationId, attrElem);
  }

  public subscribeState(observer: StateObserver) {
    this.getGameManager().stateManager.subscribe(observer);
  }

  public unsubscribeState(observer: StateObserver) {
    this.getGameManager().stateManager.unsubscribe(observer);
  }

  /////////////////////
  //  Game Objects   //
  /////////////////////

  public makeObjectGlow(objectId: ItemId) {
    this.getGameManager().objectManager.makeObjectGlow(objectId);
  }

  public makeObjectBlink(objectId: ItemId) {
    this.getGameManager().objectManager.makeObjectBlink(objectId);
  }

  public getObjPropertyMap() {
    return this.getGameManager().stateManager.getObjPropertyMap();
  }

  public setObjProperty(id: ItemId, newObjProp: ObjectProperty) {
    this.getGameManager().stateManager.setObjProperty(id, newObjProp);
  }

  public enableObjectAction(callbacks: any) {
    this.getGameManager().objectManager.enableObjectAction(callbacks);
  }

  public disableObjectAction() {
    this.getGameManager().objectManager.disableObjectAction();
  }

  /////////////////////
  //    Game BBox    //
  /////////////////////

  public getBBoxPropertyMap() {
    return this.getGameManager().stateManager.getBBoxPropertyMap();
  }

  public setBBoxProperty(id: ItemId, newBBoxProp: BBoxProperty) {
    this.getGameManager().stateManager.setBBoxProperty(id, newBBoxProp);
  }

  public enableBBoxAction(callbacks: any) {
    this.getGameManager().boundingBoxManager.enableBBoxAction(callbacks);
  }

  public disableBBoxAction() {
    this.getGameManager().boundingBoxManager.disableBBoxAction();
  }

  /////////////////////
  //  Game Objective //
  /////////////////////

  public isAllComplete(): boolean {
    return this.getGameManager().stateManager.isAllComplete();
  }

  public isObjectiveComplete(key: string): boolean {
    return this.getGameManager().stateManager.isObjectiveComplete(key);
  }

  public areObjectivesComplete(keys: string[]): boolean {
    return this.getGameManager().stateManager.areObjectivesComplete(keys);
  }

  public completeObjective(key: string): void {
    this.getGameManager().stateManager.completeObjective(key);
  }

  /////////////////////
  //   User State    //
  /////////////////////

  public addToUserStateList(listName: string, id: string): void {
    this.getGameManager().userStateManager.addToList(listName, id);
  }

  public async existsInUserStateList(listName: string, id: string): Promise<boolean> {
    return await this.getGameManager().userStateManager.doesIdExistInList(listName, id);
  }

  /////////////////////
  //   Game Layer    //
  /////////////////////

  public clearSeveralLayers(layerTypes: Layer[], withFade = false) {
    this.getGameManager().layerManager.clearSeveralLayers(layerTypes, withFade);
  }

  public addContainerToLayer(layer: Layer, gameObj: Phaser.GameObjects.GameObject) {
    this.getGameManager().layerManager.addToLayer(layer, gameObj);
  }

  public fadeInLayer(layer: Layer, fadeDuration?: number) {
    this.getGameManager().layerManager.fadeInLayer(layer, fadeDuration);
  }

  public fadeOutLayer(layer: Layer, fadeDuration?: number) {
    this.getGameManager().layerManager.fadeOutLayer(layer, fadeDuration);
  }
  /////////////////////
  //  Location Notif //
  /////////////////////

  public async bringUpUpdateNotif(message: string) {
    this.getGameManager();
    await displayNotification(message);
  }

  /////////////////////
  //   Story Action  //
  /////////////////////

  public async processGameActions(actionIds: ItemId[] | undefined) {
    await this.getGameManager().phaseManager.pushPhase(GamePhaseType.Sequence);
    await this.getGameManager().actionManager.processGameActions(actionIds);
    await this.getGameManager().phaseManager.popPhase();
  }

  public async processGameActionsInSamePhase(actionIds: ItemId[] | undefined) {
    await this.getGameManager().actionManager.processGameActions(actionIds);
  }

  /////////////////////
  //   Dialogue      //
  /////////////////////

  public async showDialogue(dialogueId: ItemId) {
    await this.getGameManager().phaseManager.pushPhase(GamePhaseType.Sequence);
    await this.getGameManager().dialogueManager.showDialogue(dialogueId);
    await this.getGameManager().phaseManager.popPhase();
  }

  public async showDialogueInSamePhase(dialogueId: ItemId) {
    await this.getGameManager().dialogueManager.showDialogue(dialogueId);
  }

  public getDialogue(dialogueId: ItemId) {
    return this.getGameManager().getCurrentCheckpoint().map.getDialogues().get(dialogueId);
  }

  /////////////////////
  //   Collectible   //
  /////////////////////

  public async obtainCollectible(collectibleId: string) {
    this.getGameManager().userStateManager.addToList('collectibles', collectibleId);
  }

  /////////////////////
  //     Pop Up      //
  /////////////////////

  public displayPopUp(itemId: ItemId, position: GamePosition, duration?: number) {
    this.getGameManager().popUpManager.displayPopUp(itemId, position, duration);
  }

  public destroyAllPopUps() {
    this.getGameManager().popUpManager.destroyAllPopUps();
  }

  public async destroyPopUp(position: GamePosition) {
    this.getGameManager().popUpManager.destroyPopUp(position);
  }

  /////////////////////
  //    Save Game    //
  /////////////////////

  public async saveGame() {
    await this.getGameManager().saveManager.saveGame();
  }

  public async saveSettings(settingsJson: SettingsJson) {
    await this.getGameManager().saveManager.saveSettings(settingsJson);
  }

  public getLoadedUserState() {
    return this.getGameManager().saveManager.getLoadedUserState();
  }

  /////////////////////
  //      Sound      //
  /////////////////////

  public playSound(soundKey: AssetKey) {
    this.getGameManager().soundManager.playSound(soundKey);
  }

  public playBgMusic(soundKey: AssetKey) {
    this.getGameManager().soundManager.playSound(soundKey);
  }

  public async stopCurrBgMusic(fadeDuration?: number) {
    this.getGameManager().soundManager.stopCurrBgMusic(fadeDuration);
  }

  public async stopAllSound() {
    this.getGameManager().soundManager.stopAllSound();
  }

  public pauseCurrBgMusic() {
    this.getGameManager().soundManager.pauseCurrBgMusic();
  }

  public continueCurrBgMusic() {
    this.getGameManager().soundManager.continueCurrBgMusic();
  }

  public applySoundSettings(userSetting: UserSaveState) {
    this.getGameManager().soundManager.applyUserSettings(userSetting);
  }

  /////////////////////
  //      Input      //
  /////////////////////

  public enableKeyboardInput(active: boolean) {
    this.getGameManager().inputManager.enableKeyboardInput(active);
  }

  public enableMouseInput(active: boolean) {
    this.getGameManager().inputManager.enableMouseInput(active);
  }

  /////////////////////
  //      Phases     //
  /////////////////////

  public async popPhase() {
    await this.getGameManager().phaseManager.popPhase();
  }

  public async pushPhase(gamePhaseType: GamePhaseType) {
    await this.getGameManager().phaseManager.pushPhase(gamePhaseType);
  }

  public async swapPhase(gamePhaseType: GamePhaseType) {
    await this.getGameManager().phaseManager.swapPhase(gamePhaseType);
  }

  public isCurrentPhase(gamePhaseType: GamePhaseType) {
    return this.getGameManager().phaseManager.isCurrentPhase(gamePhaseType);
  }

  /////////////////////
  //   Background    //
  /////////////////////

  public renderBackgroundLayerContainer(locationId: LocationId) {
    this.getGameManager().backgroundManager.renderBackgroundLayerContainer(locationId);
  }

  /////////////////////
  //   Characters    //
  /////////////////////

  public hideCharacterFromMap(characterId: ItemId) {
    this.getGameManager().characterManager.hideCharacterFromMap(characterId);
  }

  public showCharacterOnMap(characterId: ItemId) {
    this.getGameManager().characterManager.showCharacterOnMap(characterId);
  }

  public createCharacterSprite(
    characterId: ItemId,
    overrideExpression?: string,
    overridePosition?: GamePosition
  ) {
    return this.getGameManager().characterManager.createCharacterSprite(
      characterId,
      overrideExpression,
      overridePosition
    );
  }

  public getCharacterById(characterId: ItemId) {
    return this.getGameManager().characterManager.getCharacterById(characterId);
  }
}

export default GameGlobalAPI;
