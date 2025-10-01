import { create } from 'zustand';
import { PDFState, Annotation, ToolType } from '@/types';

interface PDFStore extends PDFState {
  // PDF Actions
  setPDFFile: (file: File) => void;
  setPDFBytes: (bytes: Uint8Array | null) => void;
  setNumPages: (num: number) => void;
  setCurrentPage: (page: number) => void;
  setScale: (scale: number) => void;
  
  // Annotation Actions
  addAnnotation: (annotation: Annotation) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  clearAnnotations: () => void;
  
  // Tool Actions
  setSelectedTool: (tool: ToolType) => void;
  setSelectedAnnotationId: (id: string | null) => void;
  
  // Settings Actions
  updateTextSettings: (settings: Partial<PDFStore['textSettings']>) => void;
  updateDrawSettings: (settings: Partial<PDFStore['drawSettings']>) => void;
  updateHighlightSettings: (settings: Partial<PDFStore['highlightSettings']>) => void;
  
  // Save/Load Actions
  exportProject: () => string;
  importProject: (data: string) => void;
  reset: () => void;
}

const initialState: PDFState = {
  pdfFile: null,
  pdfBytes: null,
  numPages: 0,
  currentPage: 1,
  scale: 1,
  annotations: [],
  selectedTool: 'select',
  selectedAnnotationId: null,
  textSettings: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Arial',
  },
  drawSettings: {
    color: '#000000',
    lineWidth: 2,
  },
  highlightSettings: {
    color: '#ffff00',
    lineWidth: 20,
  },
};

export const usePDFStore = create<PDFStore>((set, get) => ({
  ...initialState,

  // PDF Actions
  setPDFFile: (file) => set({ pdfFile: file }),
  setPDFBytes: (bytes) => set({ pdfBytes: bytes }),
  setNumPages: (num) => set({ numPages: num }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setScale: (scale) => set({ scale }),

  // Annotation Actions
  addAnnotation: (annotation) => 
    set((state) => ({ annotations: [...state.annotations, annotation] })),
  
  updateAnnotation: (id, updates) =>
    set((state) => ({
      annotations: state.annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      ),
    })),
  
  deleteAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((ann) => ann.id !== id),
      selectedAnnotationId: state.selectedAnnotationId === id ? null : state.selectedAnnotationId,
    })),
  
  clearAnnotations: () => set({ annotations: [] }),

  // Tool Actions
  setSelectedTool: (tool) => set({ selectedTool: tool, selectedAnnotationId: null }),
  setSelectedAnnotationId: (id) => set({ selectedAnnotationId: id }),

  // Settings Actions
  updateTextSettings: (settings) =>
    set((state) => ({ textSettings: { ...state.textSettings, ...settings } })),
  
  updateDrawSettings: (settings) =>
    set((state) => ({ drawSettings: { ...state.drawSettings, ...settings } })),
  
  updateHighlightSettings: (settings) =>
    set((state) => ({ highlightSettings: { ...state.highlightSettings, ...settings } })),

  // Save/Load Actions
  exportProject: () => {
    const state = get();
    return JSON.stringify({
      annotations: state.annotations,
      currentPage: state.currentPage,
      scale: state.scale,
      textSettings: state.textSettings,
      drawSettings: state.drawSettings,
      highlightSettings: state.highlightSettings,
    });
  },

  importProject: (data) => {
    try {
      const parsed = JSON.parse(data);
      set({
        annotations: parsed.annotations || [],
        currentPage: parsed.currentPage || 1,
        scale: parsed.scale || 1,
        textSettings: parsed.textSettings || initialState.textSettings,
        drawSettings: parsed.drawSettings || initialState.drawSettings,
        highlightSettings: parsed.highlightSettings || initialState.highlightSettings,
      });
    } catch (error) {
      console.error('Failed to import project:', error);
    }
  },

  reset: () => set(initialState),
}));

