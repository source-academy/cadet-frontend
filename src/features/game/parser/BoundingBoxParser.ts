import StringUtils from '../utils/StringUtils';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import Parser from './Parser';
import ActionParser from './ActionParser';
import { BBoxProperty } from '../boundingBoxes/GameBoundingBoxTypes';

export default class BoundingBoxParser {
  public static parse(locationId: LocationId, boundingBoxList: string[]) {
    const boundingBoxParagraphs = StringUtils.splitToParagraph(boundingBoxList);

    boundingBoxParagraphs.forEach(([header, body]: [string, string[]]) => {
      const boundingBox = this.parseBBoxConfig(locationId, header);
      if (body.length) {
        boundingBox.isInteractive = true;
        boundingBox.actionIds = ActionParser.parseActions(body);
      }
    });
  }

  private static parseBBoxConfig(locationId: LocationId, bboxDetails: string) {
    const addToLoc = bboxDetails[0] === '+';
    if (addToLoc) {
      bboxDetails = bboxDetails.slice(1);
    }

    const [bboxId, x, y, width, height] = StringUtils.splitByChar(bboxDetails, ',');
    const bboxProperty: BBoxProperty = {
      x: parseInt(x),
      y: parseInt(y),
      width: parseInt(width),
      height: parseInt(height),
      isInteractive: false,
      interactionId: bboxId
    };

    Parser.checkpoint.map.addItemToMap(GameLocationAttr.boundingBoxes, bboxId, bboxProperty);
    if (addToLoc) {
      Parser.checkpoint.map.setItemAt(locationId, GameLocationAttr.objects, bboxId);
    }

    return bboxProperty;
  }
}
