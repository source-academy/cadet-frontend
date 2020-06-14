import { Color } from '../utils/styles';
import { capitalise } from '../parser/ParserHelper';
import { speechBox } from '../commons/CommonAssets';
import { SpeakerDetail } from '../commons/CommonsTypes';

const textPadding = 10;

const speakerRect = {
  x: 220,
  y: 750,
  width: 300,
  height: 50
};

const speakerTextStyle = {
  fontFamily: 'Arial',
  fontSize: '36px',
  fill: Color.white,
  align: 'left',
  lineSpacing: 10
};

type SpeakerChangeFn = (speakerDetail: SpeakerDetail | null | undefined) => void;

function DialogueSpeakerBox(scene: Phaser.Scene): [Phaser.GameObjects.Container, SpeakerChangeFn] {
  const container = new Phaser.GameObjects.Container(scene, 0, 0);

  const rectangle = new Phaser.GameObjects.Image(scene, speakerRect.x, speakerRect.y, speechBox.key)
    .setDisplaySize(speakerRect.width, speakerRect.height)
    .setAlpha(0.8);

  const speakerText = new Phaser.GameObjects.Text(
    scene,
    speakerRect.x + textPadding,
    speakerRect.y + textPadding,
    '',
    speakerTextStyle
  ).setOrigin(0.5);

  container.add([rectangle, speakerText]);

  function changeSpeaker(speakerDetail: SpeakerDetail | null | undefined) {
    if (!speakerDetail) {
      return;
    }
    speakerText.text = capitalise(speakerDetail.speakerId);
  }

  return [container, changeSpeaker];
}

export default DialogueSpeakerBox;
