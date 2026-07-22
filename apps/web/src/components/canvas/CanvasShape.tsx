import { useRef } from 'react';
import { Group, Rect, Circle, RegularPolygon, Line } from 'react-konva';
import type Konva from 'konva';
import type { CanvasElement, ShapeElementProps } from '@inspiration/shared';
import { useDesignStore } from '@/store/useDesignStore';

interface CanvasShapeProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function CanvasShape({ element, isSelected, onSelect }: CanvasShapeProps) {
  const groupRef = useRef<Konva.Group>(null);
  const props = element.props as ShapeElementProps;

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

  const renderShape = () => {
    const commonProps = {
      fill: props.fill,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
    };

    switch (props.shapeType) {
      case 'rect':
        return (
          <Rect
            x={0}
            y={0}
            width={props.width}
            height={props.height}
            cornerRadius={props.borderRadius}
            {...commonProps}
          />
        );
      case 'circle':
        return (
          <Circle
            x={props.width / 2}
            y={props.height / 2}
            radiusX={props.width / 2}
            radiusY={props.height / 2}
            {...commonProps}
          />
        );
      case 'triangle':
        return (
          <RegularPolygon
            x={props.width / 2}
            y={props.height / 2}
            sides={3}
            radius={Math.min(props.width, props.height) / 2}
            {...commonProps}
          />
        );
      case 'star':
        return (
          <RegularPolygon
            x={props.width / 2}
            y={props.height / 2}
            sides={5}
            radius={Math.min(props.width, props.height) / 2}
            {...commonProps}
          />
        );
      case 'arrow':
        return (
          <Line
            points={[
              0,
              props.height / 2,
              props.width * 0.7,
              props.height / 2,
              props.width * 0.7,
              props.height * 0.2,
              props.width,
              props.height / 2,
              props.width * 0.7,
              props.height * 0.8,
              props.width * 0.7,
              props.height / 2,
            ]}
            closed={true}
            {...commonProps}
          />
        );
      case 'line':
        return (
          <Line
            points={[0, props.height / 2, props.width, props.height / 2]}
            stroke={props.stroke}
            strokeWidth={props.strokeWidth || 2}
          />
        );
      default:
        return (
          <Rect
            x={0}
            y={0}
            width={props.width}
            height={props.height}
            cornerRadius={props.borderRadius}
            {...commonProps}
          />
        );
    }
  };

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
      {renderShape()}
    </Group>
  );
}
