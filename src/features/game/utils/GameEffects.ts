import GameManager from 'src/pages/academy/game/subcomponents/GameManager';
import { blackScreen, screenSize } from '../commons/CommonsTypes';
import { Constants as c } from '../commons/CommonConstants';
import { Layer } from '../layer/LayerTypes';
import { sleep } from './GameUtils';

const { Rectangle } = Phaser.GameObjects;
type GameObject = Phaser.GameObjects.GameObject | Phaser.GameObjects.Text;

export const fadeOut = (targets: GameObject[], duration: number) => ({
  alpha: 0,
  targets,
  duration
});
export const fadeIn = (targets: GameObject[], duration: number) => ({
  alpha: 1,
  targets,
  duration
});

export function fadeAndDestroy(scene: Phaser.Scene, object: GameObject | null) {
  if (!object) return;
  scene.add.tween(fadeOut([object], c.fadeDuration));
  setTimeout(() => object.destroy(), c.fadeDuration);
}

export const blackFade = async (
  gameManager: GameManager,
  fadeDuration: number,
  delay: number,
  callback: any
) => {
  const fadeBlack = new Rectangle(
    gameManager,
    screenSize.x / 2,
    screenSize.y / 2,
    screenSize.x,
    screenSize.y,
    0
  );
  gameManager.layerManager.addToLayer(Layer.Effects, fadeBlack);

  // Fade in
  fadeBlack.setAlpha(0);
  gameManager.tweens.add({
    targets: fadeBlack,
    alpha: 1,
    duration: fadeDuration,
    ease: 'Power2'
  });
  await sleep(fadeDuration);

  callback();
  await sleep(delay);

  // Fade out
  fadeBlack.setAlpha(1);
  gameManager.tweens.add({
    targets: fadeBlack,
    alpha: 0,
    duration: fadeDuration,
    ease: 'Power2'
  });
  await sleep(fadeDuration);

  fadeBlack.destroy();
};

const effectAssets = [blackScreen];

export default effectAssets;
