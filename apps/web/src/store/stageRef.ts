import type Konva from 'konva';

// Module-level stage reference for cross-component access (e.g., ExportModal)
// This avoids putting a mutable ref in Zustand which would cause unnecessary re-renders.
let _stage: Konva.Stage | null = null;

export function setStage(stage: Konva.Stage | null) {
  _stage = stage;
}

export function getStage(): Konva.Stage | null {
  return _stage;
}
