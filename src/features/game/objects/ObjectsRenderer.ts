import { ObjectProperty, ObjectLayerProps } from './ObjectsTypes';
import { mapValues } from '../utils/GameUtils';
import { ObjectId } from '../commons/CommonsTypes';

type Container = Phaser.GameObjects.Container;
type Image = Phaser.GameObjects.Image;
const { Image, Container } = Phaser.GameObjects;

export function createObjectsLayer(
  scene: Phaser.Scene,
  idsToRender: ObjectId[],
  objectPropertyMap: Map<ObjectId, ObjectProperty>,
  props?: ObjectLayerProps
): [Container, Map<ObjectId, Image>] {
  const container = new Container(scene, 0, 0);

  const objectsToRender = new Map<ObjectId, ObjectProperty>();

  idsToRender.forEach(id => {
    const renderObjProperty = objectPropertyMap.get(id);
    if (renderObjProperty) {
      objectsToRender.set(id, renderObjProperty);
    }
  });

  const objectSpriteMap = mapValues(objectsToRender, objectProperty =>
    createInteractiveObject(scene, objectProperty, props || {})
  );
  container.add(Array.from(objectSpriteMap.values()));

  return [container, objectSpriteMap];
}

function createInteractiveObject(
  scene: Phaser.Scene,
  objectProperty: ObjectProperty,
  { cursor }: ObjectLayerProps
): Image {
  const { texture, x, y, actions } = objectProperty;
  const objectSprite = new Image(scene, x, y, texture).setInteractive({
    cursor,
    pixelPerfect: true
  });

  objectSprite.on('pointerdown', onClick(actions || []));
  return objectSprite;
}

function onClick(actions: string[]) {
  return () => console.log(actions);
}
