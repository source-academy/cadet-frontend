import { GameImage } from '../commons/CommonsTypes';
import { emptyObjectPropertyMap } from '../objects/ObjectsTypes';
import { emptyDialogueMap } from '../dialogue/DialogueTypes';
import { emptyBBoxPropertyMap } from '../boundingBoxes/BoundingBoxTypes';
import { screenSize } from '../commons/CommonConstants';

export const GameItemTypeDetails = {
  Dialogue: { listName: 'talkTopics', emptyMap: emptyDialogueMap },
  Object: { listName: 'objects', emptyMap: emptyObjectPropertyMap },
  BBox: { listName: 'boundingBoxes', emptyMap: emptyBBoxPropertyMap }
};

export const crashSiteImg: GameImage = {
  key: 'crash-site',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/crashSite/normal.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const classRoomImg: GameImage = {
  key: 'class-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/classOn.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const emergencyImg: GameImage = {
  key: 'emergency',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/emergency.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const hallwayImg: GameImage = {
  key: 'hallway',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/hallway/normal.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};

export const studentRoomImg: GameImage = {
  key: 'student-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png',
  xPos: screenSize.x / 2,
  yPos: screenSize.y / 2,
  imageWidth: screenSize.x,
  imageHeight: screenSize.y
};
