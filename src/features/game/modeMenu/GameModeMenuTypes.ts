import { GameImage, screenSize, shortButton } from '../commons/CommonsTypes';

export const modeButtonYPos = screenSize.y * 0.8;

export const menuEntryTweenProps = {
  y: 0,
  duration: 800,
  ease: 'Power2'
};

export const menuExitTweenProps = {
  y: screenSize.y * 0.4,
  duration: 500,
  ease: 'Power2'
};

export const modeButtonStyle = {
  fontFamily: 'Helvetica',
  fontSize: '45px',
  fill: '#abd4c6'
};

export const modeMenuBanner: GameImage = {
  key: 'mode-banner',
  path: '../assets/modeMenuBanner.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

const modeUIAssets = [modeMenuBanner, shortButton];

export default modeUIAssets;
