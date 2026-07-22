import { useRef, useEffect } from 'react';
import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import type { CanvasElement, ImageElementProps } from '@inspiration/shared';
import { useDesignStore } from '@/store/useDesignStore';

interface CanvasImageProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function CanvasImage({ element, isSelected, onSelect }: CanvasImageProps) {
  const groupRef = useRef<Konva.Group>(null);
  const imageRef = useRef<Konva.Image>(null);
  const props = element.props as ImageElementProps;

  const { moveElement, saveHistory } = useDesignStore();

  const [image, status] = useImage(props.src, 'anonymous');

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

  const hasShadow = props.shadowBlur > 0;
  const cropWidth = image ? image.width * props.cropWidth : props.width;
  const cropHeight = image ? image.height * props.cropHeight : props.height;

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
      clipFunc={(ctx) => {
        const r = props.borderRadius;
        const w = props.width;
        const h = props.height;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(w - r, 0);
        ctx.quadraticCurveTo(w, 0, w, r);
        ctx.lineTo(w, h - r);
        ctx.quadraticCurveTo(w, h, w - r, h);
        ctx.lineTo(r, h);
        ctx.quadraticCurveTo(0, h, 0, h - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
      }}
    >
      {hasShadow && (
        <Rect
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          cornerRadius={props.borderRadius}
          shadowBlur={props.shadowBlur}
          shadowColor={props.shadowColor}
          shadowOffsetX={props.shadowOffsetX}
          shadowOffsetY={props.shadowOffsetY}
          shadowOpacity={1}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
      {image && (
        <Image
          ref={imageRef}
          image={image}
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          crop={{
            x: props.cropX * (image.width || 0),
            y: props.cropY * (image.height || 0),
            width: cropWidth,
            height: cropHeight,
          }}
        />
      )}
      {!image && status !== 'loaded' && (
        <Rect
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          fill="#F3F4F6"
          cornerRadius={props.borderRadius}
        />
      )}
    </Group>
  );
}
