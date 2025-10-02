'use client';

import { useEffect, useRef, useState } from 'react';
import { usePDFStore } from '@/store/usePDFStore';
import DraggableAnnotation from './DraggableAnnotation';
import SignatureModal from './SignatureModal';
import { Position } from '@/types';

// Dynamically import PDF.js only on client side
let pdfjsLib: any = null;
if (typeof window !== 'undefined') {
  import('pdfjs-dist').then((pdfjs) => {
    pdfjsLib = pdfjs;
    // Use unpkg CDN for worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  });
}

export default function PDFCanvas() {
  const {
    pdfBytes,
    currentPage,
    scale,
    annotations,
    selectedTool,
    setSelectedTool,
    addAnnotation,
    textSettings,
    drawSettings,
    highlightSettings,
    setSelectedAnnotationId,
    deleteAnnotation,
    numPages,
  } = usePDFStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Position[]>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isPdfjsReady, setIsPdfjsReady] = useState(false);

  // Auto-open signature modal when signature tool is selected
  useEffect(() => {
    if (selectedTool === 'signature') {
      setShowSignatureModal(true);
    }
  }, [selectedTool]);

  // Initialize PDF.js
  useEffect(() => {
    const initPdfjs = async () => {
      if (typeof window !== 'undefined' && !isPdfjsReady) {
        try {
          const pdfjs = await import('pdfjs-dist');
          pdfjsLib = pdfjs;
          // Use unpkg CDN for worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
          console.log('🔧 PDF.js initialized, version:', pdfjs.version);
          setIsPdfjsReady(true);
        } catch (error) {
          console.error('Failed to initialize PDF.js:', error);
        }
      }
    };

    initPdfjs();
  }, []);

  // Load PDF
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfBytes || !isPdfjsReady || !pdfjsLib) return;

      try {
        // Clone the array buffer to prevent detachment
        const clonedBytes = new Uint8Array(pdfBytes);
        const loadingTask = pdfjsLib.getDocument({ 
          data: clonedBytes,
          // Disable auto fetch to prevent worker issues
          disableAutoFetch: false,
          disableStream: false
        });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        alert('ไม่สามารถโหลด PDF ได้: ' + error.message);
      }
    };

    loadPDF();
  }, [pdfBytes, isPdfjsReady]);

  // Render PDF page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      setIsRendering(true);
      try {
        console.log('🔄 กำลัง render PDF หน้า:', currentPage);
        const page = await pdfDoc.getPage(currentPage);
        
        // Use device pixel ratio for crisp rendering at 100%
        const devicePixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Set canvas size with high resolution
        canvas.width = viewport.width * devicePixelRatio;
        canvas.height = viewport.height * devicePixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        
        // Use setTransform for crisp rendering
        context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        
        console.log('📐 Canvas dimensions:', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          displayWidth: canvas.style.width,
          displayHeight: canvas.style.height,
          devicePixelRatio,
          scale,
          viewportWidth: viewport.width,
          viewportHeight: viewport.height
        });

        // Render PDF page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log('✅ PDF render เสร็จแล้ว! ขนาด:', viewport.width, 'x', viewport.height, 'Scale:', scale);

        // Setup drawing canvas with same dimensions
        if (drawingCanvasRef.current) {
          drawingCanvasRef.current.width = viewport.width;
          drawingCanvasRef.current.height = viewport.height;
          drawingCanvasRef.current.style.width = `${viewport.width / devicePixelRatio}px`;
          drawingCanvasRef.current.style.height = `${viewport.height / devicePixelRatio}px`;
        }
      } catch (error) {
        console.error('❌ Failed to render page:', error);
      } finally {
        setIsRendering(false);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  // Render existing draw/highlight annotations
  useEffect(() => {
    if (!drawingCanvasRef.current) return;

    const ctx = drawingCanvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);

    const currentPageAnnotations = annotations.filter(
      (ann) => ann.pageNumber === currentPage && (ann.type === 'draw' || ann.type === 'highlight')
    );

    currentPageAnnotations.forEach((ann) => {
      if (ann.type === 'draw' || ann.type === 'highlight') {
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = ann.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (ann.type === 'highlight') {
          ctx.globalAlpha = 0.5;
        } else {
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ann.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }, [annotations, currentPage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks on the container (PDF canvas area)
    if (e.target !== containerRef.current && e.target !== canvasRef.current) {
      return; // Ignore clicks on annotations
    }

    if (!containerRef.current || !canvasRef.current) return;

    // Don't allow adding annotations if PDF is not rendered
    if (!pdfDoc || canvasRef.current.width === 0) {
      alert('กรุณารอให้ PDF โหลดเสร็จก่อน');
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('🖱️ คลิก:', selectedTool, 'ตำแหน่ง:', x, y, 'Canvas size:', canvasRef.current.width, canvasRef.current.height);

    // Validate click is within canvas bounds
    if (x < 0 || y < 0 || x > canvasRef.current.width || y > canvasRef.current.height) {
      console.log('❌ คลิกนอก canvas!');
      return;
    }

    setSelectedAnnotationId(null);

    if (selectedTool === 'text') {
      const textAnnotation = {
        id: `text-${Date.now()}`,
        type: 'text' as const,
        position: { x, y }, // Use exact click position
        text: '',
        fontSize: textSettings.fontSize,
        color: textSettings.color,
        fontFamily: textSettings.fontFamily,
        fontWeight: textSettings.fontWeight,
        fontStyle: textSettings.fontStyle,
        textDecoration: textSettings.textDecoration,
        pageNumber: currentPage,
      };
      console.log('➕ เพิ่ม text annotation:', textAnnotation);
      addAnnotation(textAnnotation);
      // Auto switch back to select tool after adding text
      setSelectedTool('select');
    } else if (selectedTool === 'image') {
      imageInputRef.current?.click();
    } else if (selectedTool === 'signature') {
      console.log('✍️ เปิด signature modal');
      setShowSignatureModal(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'draw' && selectedTool !== 'highlight' && selectedTool !== 'eraser') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'eraser') {
      // Find and delete annotations under cursor
      const currentPageAnnotations = annotations.filter(
        (ann) => ann.pageNumber === currentPage && (ann.type === 'draw' || ann.type === 'highlight')
      );

      for (const ann of currentPageAnnotations) {
        if (ann.type === 'draw' || ann.type === 'highlight') {
          // Simple proximity check
          const isNear = ann.points.some(
            (point) => Math.abs(point.x - x) < 10 && Math.abs(point.y - y) < 10
          );
          if (isNear) {
            deleteAnnotation(ann.id);
            break;
          }
        }
      }
    } else {
      setIsDrawing(true);
      setCurrentDrawPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (selectedTool !== 'draw' && selectedTool !== 'highlight')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoints = [...currentDrawPoints, { x, y }];
    setCurrentDrawPoints(newPoints);

    // Draw preview
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx) return;

    const settings = selectedTool === 'highlight' ? highlightSettings : drawSettings;
    ctx.strokeStyle = settings.color;
    ctx.lineWidth = settings.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (selectedTool === 'highlight') {
      ctx.globalAlpha = 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(currentDrawPoints[currentDrawPoints.length - 1].x, currentDrawPoints[currentDrawPoints.length - 1].y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.globalAlpha = 1;
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (currentDrawPoints.length > 1) {
      const settings = selectedTool === 'highlight' ? highlightSettings : drawSettings;

      const annotation = {
        id: `${selectedTool}-${Date.now()}`,
        type: selectedTool as 'draw' | 'highlight',
        points: currentDrawPoints,
        color: settings.color,
        lineWidth: settings.lineWidth,
        pageNumber: currentPage,
      };

      addAnnotation(annotation);
    }

    setIsDrawing(false);
    setCurrentDrawPoints([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const imageData = evt.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const maxWidth = 200;
        const maxHeight = 200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const imageAnnotation = {
          id: `image-${Date.now()}`,
          type: 'image' as const,
          position: { x: 100, y: 100 },
          size: { width, height },
          imageData,
          pageNumber: currentPage,
        };
        addAnnotation(imageAnnotation);
        // Auto switch back to select tool after adding image
        setSelectedTool('select');
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSignatureSave = (signatureData: string) => {
    const signatureAnnotation = {
      id: `signature-${Date.now()}`,
      type: 'signature' as const,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      signatureData,
      pageNumber: currentPage,
    };
    console.log('➕ บันทึกลายเซ็น:', signatureAnnotation);
    addAnnotation(signatureAnnotation);
    // Auto switch back to select tool after adding signature
    setSelectedTool('select');
  };

  const currentPageAnnotations = annotations.filter(
    (ann) => ann.pageNumber === currentPage && (ann.type === 'text' || ann.type === 'image' || ann.type === 'signature')
  );

  if (!pdfDoc) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">กำลังโหลด PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative bg-white shadow-2xl rounded-lg border-0"
        style={{ touchAction: 'none', display: 'inline-block', overflow: 'visible' }}
      >
          {isRendering && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-2"></div>
                <p className="text-sm font-semibold text-gray-700">กำลังโหลดหน้า...</p>
              </div>
            </div>
          )}
          
          {!pdfDoc && !isRendering && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 min-h-[600px] pointer-events-none">
              <div className="text-center p-10">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-xl font-semibold text-gray-700">กำลังโหลด PDF...</p>
                <p className="text-sm text-gray-500 mt-2">กรุณารอสักครู่</p>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="block" style={{ display: 'block', maxWidth: 'none' }} />
          <canvas
            ref={drawingCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="absolute top-0 left-0 cursor-crosshair"
            style={{
              pointerEvents: ['draw', 'highlight', 'eraser'].includes(selectedTool) ? 'auto' : 'none',
            }}
          />
          
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ position: 'absolute' }}>
            {currentPageAnnotations.map((annotation) => (
              <div key={annotation.id} className="pointer-events-auto">
                <DraggableAnnotation annotation={annotation} />
              </div>
            ))}
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <SignatureModal
            isOpen={showSignatureModal}
            onClose={() => setShowSignatureModal(false)}
            onSave={handleSignatureSave}
          />
        </div>
    </>
  );
}

