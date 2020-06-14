import { emptyObjectPropertyMap } from '../objects/GameObjectTypes';
import { emptyDialogueMap } from '../dialogue/GameDialogueTypes';
import { emptyBBoxPropertyMap } from '../boundingBoxes/BoundingBoxTypes';
import { ImageAsset } from '../commons/CommonsTypes';
import { emptyCharacterMap } from '../character/GameCharacterTypes';

export const GameItemTypeDetails = {
  Dialogue: { listName: 'talkTopics', emptyMap: emptyDialogueMap },
  Object: { listName: 'objects', emptyMap: emptyObjectPropertyMap },
  BBox: { listName: 'boundingBoxes', emptyMap: emptyBBoxPropertyMap },
  Character: { listName: 'characters', emptyMap: emptyCharacterMap }
};

export const crashSiteImg: ImageAsset = {
  key: 'crash-site',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/crashSite/normal.png'
};

export const classRoomImg: ImageAsset = {
  key: 'class-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/classOn.png'
};

export const emergencyImg: ImageAsset = {
  key: 'emergency',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/classroom/emergency.png'
};

export const hallwayImg: ImageAsset = {
  key: 'hallway',
  path: 'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/hallway/normal.png'
};

export const studentRoomImg: ImageAsset = {
  key: 'student-room',
  path:
    'https://s3-ap-southeast-1.amazonaws.com/source-academy-assets/locations/yourRoom-dim/normal.png'
};
