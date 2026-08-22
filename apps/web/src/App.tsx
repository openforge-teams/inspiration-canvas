import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { DesignCanvas } from '@/components/canvas/DesignCanvas';
import { ExportModal } from '@/components/modals/ExportModal';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';
import { m3 } from '@/theme/m3Theme';

function App() {
  const { design } = useDesignStore();
  const { showExportModal } = useUIStore();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: m3.surface,
      }}
    >
      <Header />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftSidebar />

        <Box
          component="main"
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: m3.surfaceContainerLow }}>
            <DesignCanvas />
          </Box>

          <Paper
            elevation={0}
            square
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 0.75,
              bgcolor: m3.surfaceContainer,
              borderTop: `1px solid ${m3.outlineVariant}`,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {design.width} × {design.height}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                |
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {design.elements.length} 个元素
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {Math.round(design.zoom * 100)}%
            </Typography>
          </Paper>
        </Box>

        <RightPanel />
      </Box>

      {showExportModal && <ExportModal />}
    </Box>
  );
}

export default App;
