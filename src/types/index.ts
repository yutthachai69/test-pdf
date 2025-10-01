export type ToolType = 
  | 'select'
  | 'text'
  | 'image'
  | 'signature'
  | 'draw'
  | 'highlight'
  | 'eraser';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TextAnnotation {
  id: string;
  type: 'text';
  position: Position;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  pageNumber: number;
}

export interface ImageAnnotation {
  id: string;
  type: 'image';
  position: Position;
  size: Size;
  imageData: string; // base64
  pageNumber: number;
}

export interface SignatureAnnotation {
  id: string;
  type: 'signature';
  position: Position;
  size: Size;
  signatureData: string; // base64
  pageNumber: number;
}

export interface DrawAnnotation {
  id: string;
  type: 'draw';
  points: Position[];
  color: string;
  lineWidth: number;
  pageNumber: number;
}

export interface HighlightAnnotation {
  id: string;
  type: 'highlight';
  points: Position[];
  color: string;
  lineWidth: number;
  pageNumber: number;
}

export type Annotation = 
  | TextAnnotation 
  | ImageAnnotation 
  | SignatureAnnotation 
  | DrawAnnotation 
  | HighlightAnnotation;

export interface PDFState {
  pdfFile: File | null;
  pdfBytes: Uint8Array | null;
  numPages: number;
  currentPage: number;
  scale: number;
  annotations: Annotation[];
  selectedTool: ToolType;
  selectedAnnotationId: string | null;
  textSettings: {
    fontSize: number;
    color: string;
    fontFamily: string;
  };
  drawSettings: {
    color: string;
    lineWidth: number;
  };
  highlightSettings: {
    color: string;
    lineWidth: number;
  };
}

