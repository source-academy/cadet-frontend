import { GameChapter } from '../chapter/GameChapterTypes';
import GameMap from '../location/GameMap';
import {
  crashSiteImg,
  classRoomImg,
  emergencyImg,
  hallwayImg,
  studentRoomImg
} from '../location/GameMapConstants';
import { GameMode } from '../mode/GameModeTypes';
import { GameLocation } from '../location/GameMapTypes';
import { ImageAsset } from '../commons/CommonsTypes';
import GameObjective from '../objective/GameObjective';

const LocationSelectMap = new GameMap();

// Sample Map, arbritary set up
const locationImages: ImageAsset[] = [
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
    modes: locationModes[i]
  });
}

// Register mapping and assets
locations.forEach(location => LocationSelectMap.addLocation(location.name, location));
locationImages.forEach(asset => LocationSelectMap.addMapAsset(asset.key, asset.path));

// Register navigation
LocationSelectMap.setNavigationFrom('Class Room', ['Crash Site', 'Hallway']);
LocationSelectMap.setNavigationFrom('Crash Site', ['Class Room']);
LocationSelectMap.setNavigationFrom('Hallway', ['Class Room', 'Student Room', 'Emergency']);
LocationSelectMap.setNavigationFrom('Student Room', ['Hallway']);
LocationSelectMap.setNavigationFrom('Emergency', ['Hallway']);

const sampleDialogueObject = parseDialogue(SampleDialogue);

// Set talk topics
LocationSelectMap.setItemAt('Student Room', GameItemTypeDetails.Dialogue, 'dialogue1', {
  title: 'What happened',
  content: sampleDialogueObject
});
LocationSelectMap.setItemAt('Crash Site', GameItemTypeDetails.Dialogue, 'dialogue2', {
  title: 'Planet XAE-12',
  content: sampleDialogueObject
});
LocationSelectMap.setItemAt('Class Room', GameItemTypeDetails.Dialogue, 'dialogue3', {
  title: "Today's Lesson",
  content: sampleDialogueObject
});
LocationSelectMap.setItemAt('Emergency', GameItemTypeDetails.Dialogue, 'dialogue4', {
  title: "Where's Everyone",
  content: sampleDialogueObject
});
LocationSelectMap.setItemAt('Emergency', GameItemTypeDetails.Dialogue, 'dialogue5', {
  title: 'Any Idea?',
  content: sampleDialogueObject
});

const sampleObjectProperties = parseObjects(SampleObjects);

sampleObjectProperties.forEach((objects, locationId) => {
  objects.forEach((objectProperty, objectId) => {
    LocationSelectMap.setItemAt(locationId, GameItemTypeDetails.Object, objectId, objectProperty);
  });
});

// Set Objectives
const objectives = new GameObjective();
objectives.addObjectives(['Visit Hallway', 'Talk At Classroom']);

const LocationSelectChapter: GameChapter = {
  map: LocationSelectMap,
  startingLoc: 'Student Room',
  objectives: objectives
};

export default LocationSelectChapter;
