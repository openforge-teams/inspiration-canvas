import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ImageIcon from '@mui/icons-material/Image';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';
import type { CanvasElement } from '@inspiration/shared';
import { m3 } from '@/theme/m3Theme';

function getTypeIcon(type: CanvasElement['type']) {
  switch (type) {
    case 'text':
      return TextFieldsIcon;
    case 'image':
      return ImageIcon;
    case 'shape':
      return CropSquareIcon;
    case 'line':
      return HorizontalRuleIcon;
    default:
      return CropSquareIcon;
  }
}

function getTypeLabel(type: CanvasElement['type']) {
  switch (type) {
    case 'text':
      return '文本';
    case 'image':
      return '图片';
    case 'shape':
      return '形状';
    case 'line':
      return '线条';
    default:
      return '元素';
  }
}

export function LayerPanel() {
  const { design, updateElement, deleteElement, duplicateElement, moveElementZIndex, setSelectedIds } =
    useDesignStore();
  const { selectedElementId, setSelectedElementId } = useUIStore();

  const sortedElements = [...design.elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleToggleVisibility = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    updateElement(element.id, { visible: !element.props.visible });
  };

  const handleToggleLock = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    updateElement(element.id, { locked: !element.props.locked });
  };

  const handleSelect = (element: CanvasElement) => {
    setSelectedElementId(element.id);
    setSelectedIds([element.id]);
  };

  if (sortedElements.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CropSquareIcon sx={{ fontSize: 48, color: m3.outline, opacity: 0.4, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            暂无图层
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
            添加元素后将显示在这里
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${m3.outlineVariant}` }}>
        <Typography variant="subtitle2">图层 ({sortedElements.length})</Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', py: 0.5, px: 1 }}>
        {sortedElements.map((element) => {
          const Icon = getTypeIcon(element.type);
          const isSelected = selectedElementId === element.id;

          return (
            <ListItemButton
              key={element.id}
              selected={isSelected}
              onClick={() => handleSelect(element)}
              sx={{
                mb: 0.5,
                py: 1,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover .layer-actions': { opacity: 1 },
              }}
            >
              <IconButton size="small" onClick={(e) => handleToggleVisibility(e, element)}>
                {element.props.visible ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </IconButton>

              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  bgcolor: isSelected ? m3.primaryContainer : m3.surfaceContainerHigh,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 16, color: isSelected ? m3.onPrimaryContainer : m3.onSurfaceVariant }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ color: element.props.visible ? 'text.primary' : 'text.disabled' }}
                >
                  {element.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTypeLabel(element.type)}
                </Typography>
              </Box>

              <Box
                className="layer-actions"
                sx={{ display: 'flex', alignItems: 'center', opacity: 0, transition: 'opacity 0.2s' }}
              >
                <Tooltip title="上移一层">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElementZIndex(element.id, 'up');
                    }}
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="下移一层">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveElementZIndex(element.id, 'down');
                    }}
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="复制">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                      if (selectedElementId === element.id) setSelectedElementId(null);
                    }}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <IconButton size="small" onClick={(e) => handleToggleLock(e, element)}>
                {element.props.locked ? (
                  <LockIcon fontSize="small" sx={{ color: m3.tertiary }} />
                ) : (
                  <LockOpenIcon fontSize="small" sx={{ color: m3.outline }} />
                )}
              </IconButton>
            </ListItemButton>
          );
        })}
      </Box>
    </Box>
  );
}
