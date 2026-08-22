import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';
import { setStage } from '@/store/stageRef';
import type { CanvasElement, ElementType } from '@inspiration/shared';
import { createDefaultElement } from '@inspiration/shared';
import { CanvasText } from './CanvasText';
import { CanvasImage } from './CanvasImage';
import { CanvasShape } from './CanvasShape';
import { CanvasLine } from './CanvasLine';
import { SelectionTransformer } from './SelectionTransformer';

interface GuideLines {
  vertical: number[];
  horizontal: number[];
}

// 背景图片图层：异步加载图片并平铺到画布尺寸
function BackgroundImageLayer({ src, width, height }: { src: string; width: number; height: number }) {
  const [image] = useImage(src, 'anonymous');
  if (!image) return null;
  return (
    <KonvaImage
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      listening={false}
    />
  );
}

export function DesignCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const {
    design,
    selectedIds,
    setSelectedIds,
    clearSelection,
    deselectAll,
    setZoom,
    setScroll,
    moveElement,
    saveHistory,
    undo,
    redo,
    deleteElement,
    addElement,
  } = useDesignStore();
  const { activeTool, setActiveTool, setSelectedElementId } = useUIStore();

  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [guideLines, setGuideLines] = useState<GuideLines>({
    vertical: [],
    horizontal: [],
  });

  // 监听容器尺寸变化，初始化及设计尺寸变化时自动适配画布
  const hasInitializedRef = useRef(false);
  const prevDesignSizeRef = useRef({ width: design.width, height: design.height });
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = containerRef.current.offsetHeight;
        setStageSize({
          width: newWidth,
          height: newHeight,
        });

        // 自动计算合适的缩放以适应视口
        // 1. 初始化时自动适配
        // 2. 设计尺寸变化时（如应用模板、更改画布尺寸）自动适配
        const designSizeChanged =
          prevDesignSizeRef.current.width !== design.width ||
          prevDesignSizeRef.current.height !== design.height;

        if (newWidth > 0 && newHeight > 0 && (!hasInitializedRef.current || designSizeChanged)) {
          hasInitializedRef.current = true;
          prevDesignSizeRef.current = { width: design.width, height: design.height };
          const padding = 80;
          const scaleX = (newWidth - padding) / design.width;
          const scaleY = (newHeight - padding) / design.height;
          const fitZoom = Math.min(scaleX, scaleY, 1);
          if (Math.abs(fitZoom - design.zoom) > 0.01) {
            setZoom(fitZoom);
          }
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [design.width, design.height, setZoom]);

  // 注册 stage 引用供其他组件（如 ExportModal）使用
  useEffect(() => {
    setStage(stageRef.current);
    return () => setStage(null);
  }, []);

  // 键盘事件监听（空格键平移 + 快捷键）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
        if (stageRef.current) {
          stageRef.current.container().style.cursor = 'grab';
        }
      }

      // Ctrl/Cmd + Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y 重做
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey ? e.key.toLowerCase() === 'z' : e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
      }

      // Delete/Backspace 删除选中元素
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        selectedIds.forEach((id) => deleteElement(id));
        useUIStore.getState().setSelectedElementId(null);
      }

      // Escape 取消选中
      if (e.key === 'Escape') {
        deselectAll();
        useUIStore.getState().setSelectedElementId(null);
      }

      // Ctrl/Cmd + A 全选
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const allIds = design.elements.map((el) => el.id);
        useDesignStore.getState().setSelectedIds(allIds);
        useUIStore.getState().setSelectedElementId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (stageRef.current) {
          stageRef.current.container().style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, deleteElement, selectedIds, deselectAll, design.elements]);

  // 滚轮缩放（scroll 存储相对居中位置的偏移量，而非 Stage 绝对坐标）
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = design.zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const currentOffsetX = (stageSize.width - design.width * oldScale) / 2;
      const currentOffsetY = (stageSize.height - design.height * oldScale) / 2;
      const currentX = currentOffsetX + design.scrollX;
      const currentY = currentOffsetY + design.scrollY;

      const mousePointTo = {
        x: (pointer.x - currentX) / oldScale,
        y: (pointer.y - currentY) / oldScale,
      };

      const delta = e.evt.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(5, oldScale * delta));

      const newOffsetX = (stageSize.width - design.width * newScale) / 2;
      const newOffsetY = (stageSize.height - design.height * newScale) / 2;

      const newX = pointer.x - mousePointTo.x * newScale;
      const newY = pointer.y - mousePointTo.y * newScale;

      setZoom(newScale);
      setScroll(newX - newOffsetX, newY - newOffsetY);
    },
    [design.zoom, design.scrollX, design.scrollY, design.width, design.height, stageSize, setZoom, setScroll],
  );

  // 点击画布：空白处取消选中 / 使用工具时创建元素
  const isCanvasSurface = useCallback((target: Konva.Node) => {
    const name = target.name();
    return target === target.getStage() || name === 'canvas-bg';
  }, []);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isCanvasSurface(e.target)) return;

      // 如果当前有激活的工具（非选择），在点击位置创建对应元素
      if (activeTool !== 'select') {
        const stage = stageRef.current;
        if (!stage) return;

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        // 将屏幕坐标转换为画布坐标
        const scale = stage.scaleX();
        const x = (pointerPos.x - stage.x()) / scale;
        const y = (pointerPos.y - stage.y()) / scale;

        // 创建元素
        const elementType = activeTool as ElementType;
        const newElement = createDefaultElement(elementType, x - 100, y - 25);

        // 图片元素需要提示用户上传
        if (elementType === 'image') {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (ev) => {
            const file = (ev.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const imgSrc = reader.result as string;
                const imgEl = newElement;
                (imgEl.props as any).src = imgSrc;
                addElement(imgEl);
                setActiveTool('select');
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
          return;
        }

        // 线条工具通过左侧面板添加，画布点击不直接创建
        if (elementType === 'line') return;

        addElement(newElement);
        setActiveTool('select');
        return;
      }

      clearSelection();
      setSelectedElementId(null);
    },
    [activeTool, addElement, clearSelection, setActiveTool, setSelectedElementId, isCanvasSurface]
  );

  // 鼠标按下 - 开始平移
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isSpacePressed) {
      setIsPanning(true);
      if (stageRef.current) {
        stageRef.current.container().style.cursor = 'grabbing';
      }
    }
  }, [isSpacePressed]);

  // 鼠标移动 - 平移画布
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isPanning) return;

      setScroll(design.scrollX + e.evt.movementX, design.scrollY + e.evt.movementY);
    },
    [isPanning, design.scrollX, design.scrollY, setScroll],
  );

  // 鼠标抬起 - 结束平移
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (stageRef.current && isSpacePressed) {
      stageRef.current.container().style.cursor = 'grab';
    } else if (stageRef.current) {
      stageRef.current.container().style.cursor = 'default';
    }
  }, [isSpacePressed]);

  // 计算智能参考线
  const calculateGuideLines = useCallback(
    (movingElement: CanvasElement, newX: number, newY: number): GuideLines => {
      const threshold = 5 / (stageRef.current?.scaleX() || 1);
      const vertical: number[] = [];
      const horizontal: number[] = [];

      const movingProps = movingElement.props;
      const movingCenterX = newX + movingProps.width / 2;
      const movingCenterY = newY + movingProps.height / 2;
      const movingRight = newX + movingProps.width;
      const movingBottom = newY + movingProps.height;

      // 画布中心线
      const canvasCenterX = design.width / 2;
      const canvasCenterY = design.height / 2;

      if (Math.abs(movingCenterX - canvasCenterX) < threshold) {
        vertical.push(canvasCenterX);
      }
      if (Math.abs(movingCenterY - canvasCenterY) < threshold) {
        horizontal.push(canvasCenterY);
      }

      // 与其他元素对齐
      design.elements.forEach((el) => {
        if (el.id === movingElement.id) return;

        const props = el.props;
        const elCenterX = props.x + props.width / 2;
        const elCenterY = props.y + props.height / 2;
        const elRight = props.x + props.width;
        const elBottom = props.y + props.height;

        // 垂直对齐线
        if (Math.abs(newX - props.x) < threshold) vertical.push(props.x);
        if (Math.abs(newX - elCenterX) < threshold) vertical.push(elCenterX);
        if (Math.abs(newX - elRight) < threshold) vertical.push(elRight);
        if (Math.abs(movingCenterX - props.x) < threshold) vertical.push(props.x);
        if (Math.abs(movingCenterX - elCenterX) < threshold) vertical.push(elCenterX);
        if (Math.abs(movingCenterX - elRight) < threshold) vertical.push(elRight);
        if (Math.abs(movingRight - props.x) < threshold) vertical.push(props.x);
        if (Math.abs(movingRight - elCenterX) < threshold) vertical.push(elCenterX);
        if (Math.abs(movingRight - elRight) < threshold) vertical.push(elRight);

        // 水平对齐线
        if (Math.abs(newY - props.y) < threshold) horizontal.push(props.y);
        if (Math.abs(newY - elCenterY) < threshold) horizontal.push(elCenterY);
        if (Math.abs(newY - elBottom) < threshold) horizontal.push(elBottom);
        if (Math.abs(movingCenterY - props.y) < threshold) horizontal.push(props.y);
        if (Math.abs(movingCenterY - elCenterY) < threshold) horizontal.push(elCenterY);
        if (Math.abs(movingCenterY - elBottom) < threshold) horizontal.push(elBottom);
        if (Math.abs(movingBottom - props.y) < threshold) horizontal.push(props.y);
        if (Math.abs(movingBottom - elCenterY) < threshold) horizontal.push(elCenterY);
        if (Math.abs(movingBottom - elBottom) < threshold) horizontal.push(elBottom);
      });

      return {
        vertical: [...new Set(vertical)],
        horizontal: [...new Set(horizontal)],
      };
    },
    [design.elements, design.width, design.height],
  );

  // 拖拽元素时实时计算并显示智能参考线
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const target = e.target;
      const id = target.id();
      if (!id) return;
      const element = design.elements.find((el) => el.id === id);
      if (!element) return;
      const guides = calculateGuideLines(element, target.x(), target.y());
      setGuideLines(guides);
    },
    [design.elements, calculateGuideLines],
  );

  // 拖拽结束清除参考线
  const handleDragEnd = useCallback(() => {
    setGuideLines({ vertical: [], horizontal: [] });
  }, []);

  // 选中元素
  const handleSelect = useCallback(
    (elementId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;

      if (e.evt.shiftKey) {
        // Shift 多选
        const isSelected = selectedIds.includes(elementId);
        if (isSelected) {
          const newIds = selectedIds.filter((id) => id !== elementId);
          setSelectedIds(newIds);
          setSelectedElementId(newIds.length === 1 ? newIds[0] : null);
        } else {
          const newIds = [...selectedIds, elementId];
          setSelectedIds(newIds);
          setSelectedElementId(newIds.length === 1 ? newIds[0] : null);
        }
      } else {
        setSelectedIds([elementId]);
        setSelectedElementId(elementId);
      }
    },
    [selectedIds, setSelectedIds, setSelectedElementId],
  );

  // 渲染元素
  const renderElement = useCallback(
    (element: CanvasElement) => {
      const isSelected = selectedIds.includes(element.id);
      const onSelect = (e: Konva.KonvaEventObject<MouseEvent>) =>
        handleSelect(element.id, e);

      switch (element.type) {
        case 'text':
          return (
            <CanvasText
              key={element.id}
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        case 'image':
          return (
            <CanvasImage
              key={element.id}
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        case 'shape':
          return (
            <CanvasShape
              key={element.id}
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        case 'line':
          return (
            <CanvasLine
              key={element.id}
              element={element}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        default:
          return null;
      }
    },
    [selectedIds, handleSelect],
  );

  // 渲染背景
  const renderBackground = () => {
    const { background } = design;
    const bgElements: JSX.Element[] = [];

    // 画布阴影（底层）
    bgElements.push(
      <Rect
        key="canvas-shadow"
        x={-4}
        y={-4}
        width={design.width + 8}
        height={design.height + 8}
        fill="#FFFFFF"
        shadowColor="rgba(0,0,0,0.15)"
        shadowBlur={20}
        shadowOffset={{ x: 0, y: 4 }}
        listening={false}
      />
    );

    // 画布边框
    bgElements.push(
      <Rect
        key="canvas-border"
        x={-0.5}
        y={-0.5}
        width={design.width + 1}
        height={design.height + 1}
        stroke="#E5E7EB"
        strokeWidth={1}
        listening={false}
      />
    );

    switch (background.type) {
      case 'solid':
        bgElements.push(
          <Rect
            key="canvas-bg"
            name="canvas-bg"
            x={0}
            y={0}
            width={design.width}
            height={design.height}
            fill={background.color || '#FFFFFF'}
          />
        );
        break;
      case 'gradient':
        bgElements.push(
          <Rect
            key="canvas-bg"
            name="canvas-bg"
            x={0}
            y={0}
            width={design.width}
            height={design.height}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={
              background.gradient?.type === 'linear'
                ? {
                    x: Math.cos(((background.gradient.angle || 0) * Math.PI) / 180) *
                      design.width,
                    y: Math.sin(((background.gradient.angle || 0) * Math.PI) / 180) *
                      design.height,
                  }
                : { x: design.width, y: design.height }
            }
            fillLinearGradientColorStops={
              background.gradient?.colors.flatMap((c) => [c.offset, c.color]) || [
                0,
                '#FFFFFF',
                1,
                '#F3F4F6',
              ]
            }
          />
        );
        break;
      case 'image':
        // 白色底色，避免透明 PNG 出现透明背景
        bgElements.push(
          <Rect
            key="canvas-bg"
            name="canvas-bg"
            x={0}
            y={0}
            width={design.width}
            height={design.height}
            fill="#FFFFFF"
          />
        );
        if (background.image) {
          bgElements.push(
            <BackgroundImageLayer
              key="canvas-bg-image"
              src={background.image}
              width={design.width}
              height={design.height}
            />
          );
        }
        break;
      default:
        bgElements.push(
          <Rect
            key="canvas-bg"
            name="canvas-bg"
            x={0}
            y={0}
            width={design.width}
            height={design.height}
            fill="#FFFFFF"
          />
        );
    }

    return bgElements;
  };

  // 渲染智能参考线
  const renderGuideLines = () => {
    const lines: JSX.Element[] = [];

    guideLines.vertical.forEach((x, i) => {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[x, 0, x, design.height]}
          stroke="#4F46E5"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />,
      );
    });

    guideLines.horizontal.forEach((y, i) => {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, y, design.width, y]}
          stroke="#4F46E5"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />,
      );
    });

    return lines;
  };

  // 计算画布居中偏移
  const canvasOffsetX = (stageSize.width - design.width * design.zoom) / 2;
  const canvasOffsetY = (stageSize.height - design.height * design.zoom) / 2;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-gray-100 overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={design.zoom}
        scaleY={design.zoom}
        x={canvasOffsetX + design.scrollX}
        y={canvasOffsetY + design.scrollY}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <Layer>
          {/* 背景 */}
          {renderBackground()}

          {/* 元素列表 - 按 zIndex 排序 */}
          {[...design.elements]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderElement)}

          {/* 智能参考线 */}
          {renderGuideLines()}

          {/* 选中变换 */}
          <SelectionTransformer
            selectedIds={selectedIds}
            stageRef={stageRef as React.RefObject<Konva.Stage>}
          />
        </Layer>
      </Stage>
    </div>
  );
}
