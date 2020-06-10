import { isSpeaker, avatarKey, avatarAssetPath, getSpeakerDetails } from './DialogueHelper';
import { Constants as c } from '../commons/CommonConstants';
import { splitToLines } from '../parser/StringUtils';

export async function preloadDialogue(scene: Phaser.Scene, url: string) {
  scene.load.text(`#D${url}`, url);
  scene.load.image('speechBox', c.speechBoxPath);
}

export function loadDialogueAssets(scene: Phaser.Scene, key: string) {
  const text = scene.cache.text.get(key);
  splitToLines(text)
    .filter(isSpeaker)
    .forEach(line => loadAvatar(scene, line));
}

const loadAvatar = (scene: Phaser.Scene, line: string) => {
  const [speaker, expression] = getSpeakerDetails(line);
  scene.load.image(avatarKey(speaker, expression), avatarAssetPath(speaker, expression));
};
