import { create } from 'zustand';

interface EditorState {
  canUndo: boolean;
  canRedo: boolean;
  setUndoRedoAvailability: (canUndo: boolean, canRedo: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  canUndo: false,
  canRedo: false,
  setUndoRedoAvailability: (canUndo, canRedo) => set({ canUndo, canRedo }),
}));
