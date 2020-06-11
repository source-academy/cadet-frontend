import { GameChapter } from '../chapter/GameChapterTypes';
import GameMap from '../location/GameMap';
import {
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg,
  GameLocation
} from '../location/GameMapTypes';
import { GameMode } from '../mode/GameModeTypes';
import { GameImage } from 'src/features/game/commons/CommonsTypes';
import { parseDialogue } from '../parser/DialogueParser';
import { SampleDialogue, SampleObjects } from './LocationAssets';
import { parseObjects } from '../parser/ObjectsParser';

const LocationSelectMap = new GameMap();

// Sample Map, arbritary set up
const locationImages: GameImage[] = [
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg
];

const locationNames: string[] = [
  'Crash Site',
  'Class Room',
  'Emergency',
  'Hallway',
  'Student Room'
];

const locationModes: GameMode[][] = [
  [GameMode.Talk, GameMode.Move],
  [GameMode.Explore, GameMode.Talk, GameMode.Move],
  [GameMode.Talk, GameMode.Move],
  [GameMode.Move],
  [GameMode.Explore, GameMode.Move, GameMode.Talk]
];

const locations: GameLocation[] = new Array<GameLocation>();
for (let i = 0; i < locationImages.length; i++) {
  locations.push({
    name: locationNames[i],
    assetKey: locationImages[i].key,
    assetXPos: locationImages[i].xPos,
    assetYPos: locationImages[i].yPos,
    modes: locationModes[i]
  });
}

// Register mapping and assets
locations.forEach(location => LocationSelectMap.setLocation(location));
locationImages.forEach(asset => LocationSelectMap.addLocationAsset(asset));

// Register navigation
LocationSelectMap.setNavigationFrom('Class Room', ['Crash Site', 'Hallway']);
LocationSelectMap.setNavigationFrom('Crash Site', ['Class Room']);
LocationSelectMap.setNavigationFrom('Hallway', ['Class Room', 'Student Room', 'Emergency']);
LocationSelectMap.setNavigationFrom('Student Room', ['Hallway']);
LocationSelectMap.setNavigationFrom('Emergency', ['Hallway']);

const sampleDialogueObject = parseDialogue(SampleDialogue);

// Set talk topics
LocationSelectMap.setTalkTopicAt('Student Room', 'dialogue1', {
  title: 'What happened',
  content: sampleDialogueObject
});
LocationSelectMap.setTalkTopicAt('Crash Site', 'dialogue2', {
  title: 'Planet XAE-12',
  content: sampleDialogueObject
});
LocationSelectMap.setTalkTopicAt('Class Room', 'dialogue3', {
  title: "Today's Lesson",
  content: sampleDialogueObject
});
LocationSelectMap.setTalkTopicAt('Emergency', 'dialogue4', {
  title: "Where's Everyone",
  content: sampleDialogueObject
});
LocationSelectMap.setTalkTopicAt('Emergency', 'dialogue5', {
  title: 'Any Idea?',
  content: sampleDialogueObject
});

const sampleObjectProperties = parseObjects(SampleObjects);

sampleObjectProperties.forEach((objects, locationId) => {
  LocationSelectMap.setObjectsAt(locationId, objects);
});

const LocationSelectChapter: GameChapter = {
  map: LocationSelectMap,
  startingLoc: 'Student Room'
};

export default LocationSelectChapter;
