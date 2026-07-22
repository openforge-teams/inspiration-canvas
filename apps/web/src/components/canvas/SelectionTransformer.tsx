import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import type Konva from 'konva';
import { useDesignStore } from '@/store/useDesignStore';

interface SelectionTransformerProps {
  selectedIds: string[];
  stageRef: React.RefObject<Konva.Stage>;
}

export function SelectionTransformer({
  selectedIds,
  stageRef,
}: SelectionTransformerProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const { design, resizeElement, moveElement, rotateElement, saveHistory } =
    useDesignStore();

  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const transformer = transformerRef.current;
    const nodes: Konva.Node[] = [];

    selectedIds.forEach((id) => {
      const node = stageRef.current?.findOne(`#${id}`);
      if (node) nodes.push(node);
    });

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, stageRef, design.elements]);

  const handleTransformStart = () => {
    // 变换开始时记录初始状态
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const nodes = transformerRef.current?.nodes();
    if (!nodes || nodes.length === 0) return;

    nodes.forEach((node) => {
      const id = node.id();
      const element = design.elements.find((el) => el.id === id);
      if (!element) return;

      const groupNode = node as Konva.Group;
      const scaleX = groupNode.scaleX();
      const scaleY = groupNode.scaleY();
      const rotation = groupNode.rotation();
      const x = groupNode.x();
      const y = groupNode.y();

      const newWidth = element.props.width * Math.abs(scaleX);
      const newHeight = element.props.height * Math.abs(scaleY);

      // 重置缩放，因为我们用实际尺寸来表示
      groupNode.scaleX(1);
      groupNode.scaleY(1);

      resizeElement(id, newWidth, newHeight, x, y);
      rotateElement(id, rotation);
    });

    saveHistory();
  };

  const handleDragStart = () => {
    // 拖拽开始
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const nodes = transformerRef.current?.nodes();
    if (!nodes || nodes.length === 0) return;

    nodes.forEach((node) => {
      const id = node.id();
      moveElement(id, node.x(), node.y());
    });

    saveHistory();
  };

  if (selectedIds.length === 0) return null;

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // 限制最小尺寸
        if (newBox.width < 5 || newBox.height < 5) return oldBox;
        return newBox;
      }}
      onTransformStart={handleTransformStart}
      onTransformEnd={handleTransformEnd}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      rotateEnabled={true}
      enabledAnchors={[
        'top-left',
        'top-center',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ]}
      anchorSize={8}
      anchorCornerRadius={2}
      borderStroke="#4F46E5"
      borderStrokeWidth={1}
      anchorStroke="#4F46E5"
      anchorFill="#FFFFFF"
      anchorStrokeWidth={1}
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      rotationSnapTolerance={5}
    />
  );
}
