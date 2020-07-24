import { screenCenter, screenSize } from '../commons/CommonConstants';

const popUpXOffset = 350;
const popUpYPos = screenCenter.y / 2;

const popUpConstants = {
  imgXOffset: 20,
  imgYOffset: 20,
  rect: {
    x: { Left: popUpXOffset, Middle: screenCenter.x, Right: screenSize.x - popUpXOffset },
    y: popUpYPos,
    scale: { Small: 0.7, Medium: 1, Large: 2 },
    width: 280,
    height: 280
  },
  tweenDuration: 300
};

export default popUpConstants;
