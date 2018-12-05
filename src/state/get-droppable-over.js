// @flow
import type { Position, Rect } from 'css-box-model';
import { toDroppableList } from './dimension-structures';
import isPositionInFrame from './visibility/is-position-in-frame';
import { find } from '../native-with-fallback';
import type {
  DroppableDimension,
  DroppableDimensionMap,
  DroppableId,
} from '../types';

type Args = {|
  target: Position,
  droppables: DroppableDimensionMap,
  draggable: any,
|};

export default ({ target, droppables, draggable }: Args): ?DroppableId => {
  const maybe = toDroppableList(droppables)
    .filter(
      (droppable: DroppableDimension): boolean => {
        // only want enabled droppables
        if (!droppable.isEnabled) {
          return false;
        }

        const active: ?Rect = droppable.subject.active;

        if (!active) {
          return false;
        }

        if (draggable.descriptor.id === droppable.descriptor.id) return false;
        // Not checking to see if visible in viewport
        // as the target might be off screen if dragging a large draggable
        // Not adjusting target for droppable scroll as we are just checking
        // if it is over the droppable - not its internal impact
        return isPositionInFrame(active)(target);
      },
    )
    .sort(
      (a, b) =>
        a.subject.active.width * a.subject.active.height -
        b.subject.active.width * b.subject.active.height,
    );
  if (!maybe.length) return null;
  return maybe[0].descriptor.id;
};
