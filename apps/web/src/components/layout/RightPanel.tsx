import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Palette, Layers } from '@mui/icons-material';
import { useUIStore, type RightTabType } from '@/store/useUIStore';
import { ElementProperties } from '../panels/ElementProperties';
import { DesignProperties } from '../panels/DesignProperties';
import { LayerPanel } from '../panels/LayerPanel';
import { m3 } from '@/theme/m3Theme';

const TABS: { id: RightTabType; icon: typeof Palette; label: string }[] = [
  { id: 'design', icon: Palette, label: '设计' },
  { id: 'layers', icon: Layers, label: '图层' },
];

export function RightPanel() {
  const { rightTab, setRightTab, selectedElementId } = useUIStore();

  return (
    <Paper
      elevation={0}
      square
      sx={{
        width: 300,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        bgcolor: m3.surfaceContainerLowest,
        borderLeft: `1px solid ${m3.outlineVariant}`,
      }}
    >
      {/* M3 segmented tab bar */}
      <Box
        sx={{
          display: 'flex',
          p: 1,
          gap: 0.5,
          borderBottom: `1px solid ${m3.outlineVariant}`,
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = rightTab === tab.id;
          return (
            <Box
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                py: 1.25,
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: isActive ? m3.secondaryContainer : 'transparent',
                color: isActive ? m3.onSecondaryContainer : m3.onSurfaceVariant,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: isActive ? m3.secondaryContainer : m3.surfaceContainerHigh,
                },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{tab.label}</Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {rightTab === 'design' && (
          <Box sx={{ height: '100%', overflowY: 'auto' }}>
            {selectedElementId ? <ElementProperties /> : <DesignProperties />}
          </Box>
        )}
        {rightTab === 'layers' && <LayerPanel />}
      </Box>
    </Paper>
  );
}
