import { defaultLayerSequence, Layer } from './GameLayerTypes';
import { fadeIn } from '../effects/FadeEffect';
import { Constants } from '../commons/CommonConstants';
import GameActionManager from 'src/features/game/action/GameActionManager';
import { sleep } from '../utils/GameUtils';

class GameLayerManager {
  private mainLayer: Phaser.GameObjects.Container | undefined;
  private layers: Map<Layer, Phaser.GameObjects.Container>;

  constructor() {
    this.mainLayer = undefined;
    this.layers = new Map<Layer, Phaser.GameObjects.Container>();
  }

  public initialiseMainLayer(scene: Phaser.Scene) {
    this.mainLayer = new Phaser.GameObjects.Container(scene, 0, 0);
    scene.add.existing(this.mainLayer);
    for (const layerType of defaultLayerSequence) {
      const layerContainer = new Phaser.GameObjects.Container(scene, 0, 0);
      this.layers.set(layerType, layerContainer);
      this.mainLayer.add(layerContainer);
    }
  }

  public getLayer(layerType: Layer) {
    return this.layers.get(layerType);
  }

  public hideLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(false);
  }

  public showLayer(layerType: Layer) {
    const layerToHide = this.layers.get(layerType);
    layerToHide && layerToHide.setVisible(true);
  }

  public async fadeInLayer(layerType: Layer, fadeDuration = Constants.fadeDuration) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    if (!gameManager) {
      return;
    }
    const layerToFadeIn = this.layers.get(layerType);

    if (!layerToFadeIn) {
      return;
    }
    layerToFadeIn.setAlpha(0);
    gameManager.tweens.add(fadeIn([layerToFadeIn], fadeDuration));
    sleep(fadeDuration);
  }

  public addToLayer(layerType: Layer, gameObject: Phaser.GameObjects.GameObject) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    layerContainer.add(gameObject);
  }

  public clearSeveralLayers(layerTypes: Layer[], withFade = false) {
    layerTypes.forEach(layerType => this.clearLayerContents(layerType));
  }

  public clearAllLayers() {
    this.layers.forEach((_, layerType) => this.clearLayerContents(layerType));
  }

  public clearLayerContents(layerType: Layer) {
    const layerContainer = this.layers.get(layerType);
    if (!layerContainer) {
      return;
    }
    layerContainer.list.map((gameObject: Phaser.GameObjects.GameObject) => gameObject.destroy());
  }
}

export default GameLayerManager;
