import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ShareIcon from '@mui/icons-material/Share';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import PaletteIcon from '@mui/icons-material/Palette';
import { useUIStore } from '@/store/useUIStore';
import { useDesignStore } from '@/store/useDesignStore';
import { m3 } from '@/theme/m3Theme';

export function Header() {
  const { setShowExportModal } = useUIStore();
  const { design, updateTitle, setZoom, undo, redo, historyIndex, history } = useDesignStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(design.title);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const zoom = design.zoom;

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateTitle(titleInput.trim());
    } else {
      setTitleInput(design.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleInput(design.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: m3.surfaceContainerLowest,
        color: m3.onSurface,
        borderBottom: `1px solid ${m3.outlineVariant}`,
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 1, px: 2 }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 3,
              bgcolor: m3.primaryContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PaletteIcon sx={{ color: m3.onPrimaryContainer, fontSize: 22 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 500, color: m3.onSurface }}>
            灵感画布
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: m3.outlineVariant }} />

        {/* Editable title */}
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 160 }}>
          {isEditingTitle ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                size="small"
                sx={{ width: 200 }}
              />
              <IconButton size="small" onClick={handleTitleSubmit} color="primary">
                <CheckIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              onClick={() => {
                setTitleInput(design.title);
                setIsEditingTitle(true);
              }}
              endIcon={<EditIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
              sx={{
                color: m3.onSurface,
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                '&:hover': { bgcolor: m3.surfaceContainerHigh },
              }}
            >
              {design.title}
            </Button>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Undo / Redo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: m3.surfaceContainerHigh,
            borderRadius: 3,
            p: 0.5,
          }}
        >
          <Tooltip title="撤销 (Ctrl+Z)">
            <span>
              <IconButton size="small" onClick={undo} disabled={!canUndo}>
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="重做 (Ctrl+Shift+Z)">
            <span>
              <IconButton size="small" onClick={redo} disabled={!canRedo}>
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Zoom controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: m3.surfaceContainerHigh,
            borderRadius: 3,
            p: 0.5,
            ml: 1,
          }}
        >
          <Tooltip title="缩小">
            <IconButton size="small" onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            onClick={() => setZoom(1)}
            sx={{
              minWidth: 52,
              color: m3.onSurface,
              fontWeight: 500,
              fontSize: '0.75rem',
              borderRadius: 2,
            }}
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Tooltip title="放大">
            <IconButton size="small" onClick={() => setZoom(Math.min(zoom + 0.1, 4))}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 1.5, borderColor: m3.outlineVariant }} />

        {/* Actions */}
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          sx={{
            borderColor: m3.outline,
            color: m3.onSurface,
            borderRadius: 5,
            mr: 1,
          }}
        >
          分享
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => setShowExportModal(true)}
          sx={{ borderRadius: 5 }}
        >
          导出
        </Button>
      </Toolbar>
    </AppBar>
  );
}
