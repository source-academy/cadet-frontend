import GameManager from 'src/features/game/scenes/gameManager/GameManager';
import { Layer } from '../layer/GameLayerTypes';
import { sleep } from '../utils/GameUtils';
import { screenSize, screenCenter, Constants } from '../commons/CommonConstants';
import { Color, hex } from '../utils/StyleUtils';

export const fadeOut = (
  targets: Phaser.GameObjects.GameObject[],
  duration = Constants.fadeDuration
) => ({
  alpha: 0,
  targets,
  duration,
  ease: 'Power2'
});

export const fadeIn = (
  targets: Phaser.GameObjects.GameObject[],
  duration = Constants.fadeDuration
) => ({
  alpha: 1,
  targets,
  duration,
  ease: 'Power2'
});

type FadeProps = {
  fadeDuration?: number;
};

export function fadeAndDestroy(
  scene: Phaser.Scene,
  object: Phaser.GameObjects.GameObject | null,
  { fadeDuration }: FadeProps = {}
) {
  if (!object) return;
  scene.add.tween(fadeOut([object], fadeDuration || Constants.fadeDuration));
  setTimeout(() => object.destroy(), fadeDuration || Constants.fadeDuration);
}

export function blackScreen(scene: Phaser.Scene) {
  return new Phaser.GameObjects.Rectangle(
    scene,
    screenCenter.x,
    screenCenter.y,
    screenSize.x,
    screenSize.y,
    0
  );
}

export function whiteScreen(scene: Phaser.Scene) {
  return new Phaser.GameObjects.Rectangle(
    scene,
    screenCenter.x,
    screenCenter.y,
    screenSize.x,
    screenSize.y,
    hex(Color.white)
  );
}

export function blackFadeIn(gameManager: GameManager, { fadeDuration }: FadeProps = {}) {
  const fadeBlack = blackScreen(gameManager);
  gameManager.layerManager.addToLayer(Layer.Effects, fadeBlack);
  fadeAndDestroy(gameManager, fadeBlack, { fadeDuration });
}

export const blackFade = async (
  gameManager: GameManager,
  fadeDuration: number,
  delay: number,
  callback: any
) => {
  const fadeBlack = blackScreen(gameManager);
  gameManager.layerManager.addToLayer(Layer.Effects, fadeBlack);

  fadeBlack.setAlpha(0);
  gameManager.tweens.add(fadeIn([fadeBlack], fadeDuration));
  await sleep(fadeDuration);

  callback();
  await sleep(delay);

  fadeBlack.setAlpha(1);
  gameManager.tweens.add(fadeOut([fadeBlack], fadeDuration));
  await sleep(fadeDuration);

  fadeBlack.destroy();
};