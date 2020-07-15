import FontAssets from '../assets/FontAssets';
import { screenSize } from '../commons/CommonConstants';
import { BitmapFontStyle } from '../commons/CommonTypes';
import { HexColor } from '../utils/StyleUtils';

export const escapeOptButtonStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const volumeRadioOptTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 20,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

export const optTextStyle: BitmapFontStyle = {
  key: FontAssets.zektonFont.key,
  size: 30,
  fill: HexColor.lightBlue,
  align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
};

const escapeConstants = {
  textOriX: 0.33,
  textOriY: 0.85,
  buttonYPos: screenSize.y * 0.15,

  optTextXPos: screenSize.x * 0.38,
  optTextYPos: screenSize.y * 0.38,
  radioButtonsXSpace: screenSize.x * 0.2,

  volOptXPos: screenSize.x * 0.05,
  volOptYPos: -screenSize.y * 0.1
};

export default escapeConstants;
