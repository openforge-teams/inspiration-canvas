import { useRef } from 'react';
import { Group, Line } from 'react-konva';
import type Konva from 'konva';
import type { CanvasElement, LineElementProps } from '@inspiration/shared';
import { useDesignStore } from '@/store/useDesignStore';

interface CanvasLineProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function CanvasLine({ element, isSelected, onSelect }: CanvasLineProps) {
  const groupRef = useRef<Konva.Group>(null);
  const props = element.props as LineElementProps;

  const { moveElement, saveHistory } = useDesignStore();

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onSelect(e);
  };

  const handleDragStart = () => {
    // 拖拽开始
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    moveElement(element.id, e.target.x(), e.target.y());
    saveHistory();
  };

  const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = isSelected ? 'move' : 'pointer';
    }
  };

  const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'default';
    }
  };

  if (!props.visible) return null;

  return (
    <Group
      ref={groupRef}
      id={element.id}
      x={props.x}
      y={props.y}
      width={props.width}
      height={props.height}
      rotation={props.rotation}
      opacity={props.opacity}
      draggable={!props.locked}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Line
        points={props.points}
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        hitStrokeWidth={Math.max(props.strokeWidth * 3, 10)}
        lineCap="round"
        lineJoin="round"
      />
    </Group>
  );
}
