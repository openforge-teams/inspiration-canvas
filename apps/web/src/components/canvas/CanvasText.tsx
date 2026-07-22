import { useRef, useEffect, useState } from 'react';
import { Group, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import type { CanvasElement, TextElementProps } from '@inspiration/shared';
import { useDesignStore } from '@/store/useDesignStore';

interface CanvasTextProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export function CanvasText({ element, isSelected, onSelect }: CanvasTextProps) {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const [isEditing, setIsEditing] = useState(false);
  const props = element.props as TextElementProps;

  const { updateElement, moveElement, saveHistory } = useDesignStore();

  useEffect(() => {
    if (isEditing && textRef.current) {
      // 创建 HTML input 用于编辑
      const textNode = textRef.current;
      const stage = textNode.getStage();
      if (!stage) return;

      const container = stage.container();
      const input = document.createElement('textarea');
      container.appendChild(input);

      input.value = props.text;
      input.style.position = 'absolute';
      input.style.top = `${stage.container().offsetTop + (props.y * stage.scaleX()) + stage.y()}px`;
      input.style.left = `${stage.container().offsetLeft + (props.x * stage.scaleX()) + stage.x()}px`;
      input.style.width = `${props.width * stage.scaleX()}px`;
      input.style.height = `${props.height * stage.scaleY()}px`;
      input.style.fontSize = `${props.fontSize * stage.scaleX()}px`;
      input.style.fontFamily = props.fontFamily;
      input.style.fontWeight = String(props.fontWeight);
      input.style.fontStyle = props.fontStyle;
      input.style.color = props.fill;
      input.style.textAlign = props.textAlign;
      input.style.lineHeight = String(props.lineHeight);
      input.style.letterSpacing = `${props.letterSpacing}px`;
      input.style.padding = `${props.padding}px`;
      input.style.border = 'none';
      input.style.outline = 'none';
      input.style.background = 'transparent';
      input.style.resize = 'none';
      input.style.overflow = 'hidden';
      input.style.transformOrigin = 'top left';
      input.style.transform = `rotate(${props.rotation}deg)`;
      input.style.zIndex = '1000';

      input.focus();
      input.select();

      const handleBlur = () => {
        const newText = input.value;
        if (newText !== props.text) {
          updateElement(element.id, { text: newText });
          saveHistory();
        }
        input.remove();
        setIsEditing(false);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleBlur();
        }
        if (e.key === 'Escape') {
          input.remove();
          setIsEditing(false);
        }
      };

      input.addEventListener('blur', handleBlur);
      input.addEventListener('keydown', handleKeyDown);
    }
  }, [isEditing]);

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onSelect(e);
  };

  const handleDoubleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsEditing(true);
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
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Text
        ref={textRef}
        text={props.text}
        width={props.width}
        height={props.height}
        fontSize={props.fontSize}
        fontFamily={props.fontFamily}
        fontStyle={props.fontStyle === 'italic' ? 'italic' : 'normal'}
        fontWeight={String(props.fontWeight)}
        textDecoration={props.textDecoration}
        align={props.textAlign}
        fill={props.fill}
        lineHeight={props.lineHeight}
        letterSpacing={props.letterSpacing}
        padding={props.padding}
      />
    </Group>
  );
}
