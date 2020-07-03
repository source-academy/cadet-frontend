import { splitToLines, mapByHeader, isEnclosedBySquareBrackets, splitByChar } from './ParserHelper';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import { Constants } from '../commons/CommonConstants';
import ActionParser from './ActionParser';

function objectAssetKey(shortPath: string) {
  return shortPath;
}

function objectAssetValue(shortPath: string) {
  let extension;
  let filename: string;
  if (shortPath.includes('.')) {
    const shortPathArray = shortPath.split('.');
    extension = shortPathArray.pop();
    filename = shortPathArray.join('.');
  } else {
    filename = shortPath;
  }

  const [, folder, texture, skin] = filename.split('/');
  if (folder === 'objects') {
    return `${Constants.assetsFolder}/${folder}/${texture}/${skin || 'normal'}.${
      extension || 'png'
    }`;
  } else if (folder === 'avatars') {
    return `${Constants.assetsFolder}${shortPath}`;
  } else {
    return `${Constants.assetsFolder}/${folder}/${texture}.${extension || 'png'}`;
  }
}

export default function ObjectParser(fileName: string, fileContent: string) {
  const lines: string[] = splitToLines(fileContent);
  const locationRawObjectsMap: Map<LocationId, string[]> = mapByHeader(
    lines,
    isEnclosedBySquareBrackets
  );

  locationRawObjectsMap.forEach(addObjectListToLoc);
}

function addObjectListToLoc(objectsList: string[], locationId: LocationId): void {
  const separatorIndex = objectsList.findIndex(object => object === '$');
  const objectDetails = objectsList.slice(
    0,
    separatorIndex === -1 ? objectsList.length : separatorIndex
  );

  // Parse basic object
  objectDetails.forEach(objectDetail => {
    const toAddToMap = objectDetail && objectDetail[0] === '+';
    if (toAddToMap) {
      objectDetail = objectDetail.slice(1);
    }

    const [objectId, shortPath, x, y, width, height] = splitByChar(objectDetail, ',');

    const object = {
      assetKey: objectAssetKey(shortPath),
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width) || undefined,
      height: parseInt(height) || undefined,
      isInteractive: false,
      interactionId: objectId
    };

    Parser.checkpoint.map.addItemToMap(GameLocationAttr.objects, objectId, object);

    Parser.checkpoint.map.addMapAsset(objectAssetKey(shortPath), objectAssetValue(shortPath));

    if (toAddToMap) {
      Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.objects, objectId);
    }
  });

  // Parse actions
  if (separatorIndex !== -1) {
    const objectActions = objectsList.slice(separatorIndex + 1, objectsList.length);
    objectActions.forEach(objectDetail => {
      const [objectId, ...actions] = objectDetail.split(', ');

      const objectProperty = Parser.checkpoint.map.getObjects().get(objectId);
      if (objectProperty) {
        objectProperty.actionIds = ActionParser(actions);
        objectProperty.isInteractive = true;
      }
    });
  }
}
