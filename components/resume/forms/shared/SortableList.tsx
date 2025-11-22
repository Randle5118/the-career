import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// SortableItem component
interface SortableItemProps {
  id: string;
  children: (dragHandleProps: any) => React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  // 將 attributes 和 listeners 傳遞給 children 作為 dragHandleProps
  // 這樣 children 就可以決定哪裡是可以拖拉的 (例如 FormCard 的 handle)
  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div ref={setNodeRef} style={style}>
      {children(dragHandleProps)}
    </div>
  );
}

// SortableList component
interface SortableListProps<T extends { id?: string }> {
  items: T[];
  onDragEnd: (event: DragEndEvent) => void;
  renderItem: (item: T, index: number, dragHandleProps: any) => React.ReactNode;
  strategy?: any;
}

export function SortableList<T extends { id?: string }>({
  items,
  onDragEnd,
  renderItem,
  strategy = verticalListSortingStrategy,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 避免點擊時觸發拖拉
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id || '')}
        strategy={strategy}
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <SortableItem key={item.id || index} id={item.id || `item-${index}`}>
              {(dragHandleProps) => renderItem(item, index, dragHandleProps)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

