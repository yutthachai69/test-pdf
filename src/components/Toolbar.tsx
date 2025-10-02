'use client';

import { usePDFStore } from '@/store/usePDFStore';
import { ToolType } from '@/types';
import { useRef } from 'react';
import { saveAs } from 'file-saver';

export default function Toolbar() {
  const {
    selectedTool,
    setSelectedTool,
    textSettings,
    updateTextSettings,
    drawSettings,
    updateDrawSettings,
    highlightSettings,
    updateHighlightSettings,
    clearAnnotations,
    scale,
    setScale,
    currentPage,
    setCurrentPage,
    numPages,
    pdfBytes,
    annotations,
  } = usePDFStore();

  const tools: { type: ToolType; icon: React.ReactNode; label: string; color: string }[] = [
    { 
      type: 'select', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ), 
      label: 'Select', 
      color: 'from-gray-500 to-gray-600' 
    },
    { 
      type: 'text', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ), 
      label: 'Text', 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      type: 'image', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      label: 'Image', 
      color: 'from-green-500 to-green-600' 
    },
    { 
      type: 'signature', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ), 
      label: 'Sign', 
      color: 'from-purple-500 to-purple-600' 
    },
    { 
      type: 'draw', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ), 
      label: 'Draw', 
      color: 'from-orange-500 to-orange-600' 
    },
    { 
      type: 'highlight', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ), 
      label: 'Highlight', 
      color: 'from-yellow-500 to-yellow-600' 
    },
    { 
      type: 'eraser', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ), 
      label: 'Erase', 
      color: 'from-red-500 to-red-600' 
    },
  ];

  const handleExportPDF = async () => {
    if (!pdfBytes) {
      alert('No PDF loaded');
      return;
    }

    if (annotations.length === 0) {
      alert('No annotations to export');
      return;
    }

    try {
      // Dynamic import of pdf-lib
      const { PDFDocument, rgb } = await import('pdf-lib');
      
      // Load the original PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      
      // ค่าที่ต้องใช้ในการแปลงพิกัด
      const dpr = window.devicePixelRatio || 1;
      // ตอนเรนเดอร์หน้า คุณใช้ finalScale = scale * dpr
      const FINAL_SCALE = scale * dpr;

      // helper functions
      const hexToRgb = (hex: string) => {
        const h = hex.replace('#','');
        return {
          r: parseInt(h.slice(0,2),16)/255,
          g: parseInt(h.slice(2,4),16)/255,
          b: parseInt(h.slice(4,6),16)/255,
        };
      };

      const dataURLtoUint8Array = (dataURL: string) => {
        const base64 = dataURL.split(',')[1];
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
      };

      console.log('Exporting with FINAL_SCALE:', FINAL_SCALE, 'scale:', scale, 'dpr:', dpr);
      console.log('Total annotations to process:', annotations.length);
      console.log('Annotations data:', annotations.map(a => ({ 
        id: a.id, 
        type: a.type, 
        pageNumber: a.pageNumber, 
        page: a.page,
        text: a.type === 'text' ? a.text : 'N/A'
      })));

      for (const ann of annotations) {
        const page = pages[(ann.pageNumber || ann.page || 1) - 1];
        if (!page) continue;
        const { width: pageW, height: pageH } = page.getSize();

        if (ann.type === 'text') {
          console.log('Processing text annotation:', ann.text, 'has Thai chars:', /[\u0E00-\u0E7F]/.test(ann.text || ''));
          const { r,g,b } = hexToRgb(ann.color);
          const fontSize = ann.fontSize || 12;

          // canvas(px) -> pdf(pt)
          const x = ann.position.x / FINAL_SCALE;
          const y = pageH - (ann.position.y / FINAL_SCALE) - fontSize;

          // ตรวจสอบว่ามีตัวอักษรไทยหรือไม่
          const hasThaiChars = /[\u0E00-\u0E7F]/.test(ann.text || '');
          
          if (hasThaiChars) {
            // ถ้ามีตัวอักษรไทย ให้วาดกรอบแทน (เพราะ pdf-lib ไม่รองรับไทยโดยตรง)
            page.drawRectangle({
              x, y: y - 2,
              width: Math.max((ann.text?.length || 1) * (fontSize*0.6), 40),
              height: fontSize + 4,
              borderColor: rgb(r,g,b),
              borderWidth: 1,
              color: rgb(r*0.1, g*0.1, b*0.1), // Light background
            });
            
            // วาดข้อความภาษาอังกฤษแทน (ถ้ามี)
            const englishText = (ann.text || '').replace(/[\u0E00-\u0E7F]/g, '');
            if (englishText.trim()) {
              page.drawText(englishText.trim(), {
                x: x + 2, y: y + 2, size: fontSize * 0.8,
                color: rgb(r,g,b),
              });
            }
          } else {
            // ถ้าไม่มีตัวอักษรไทย ใช้ฟอนต์เริ่มต้น
            try {
              page.drawText(ann.text || '', {
                x, y, size: fontSize,
                color: rgb(r,g,b),
              });
            } catch {
              // ถ้าไม่สามารถวาดข้อความได้ ให้วาดกรอบแทน
              page.drawRectangle({
                x, y: y - 2,
                width: Math.max((ann.text?.length || 1) * (fontSize*0.6), 40),
                height: fontSize + 4,
                borderColor: rgb(r,g,b),
                borderWidth: 1,
              });
            }
          }
        }

        if (ann.type === 'draw' || ann.type === 'highlight') {
          const { r,g,b } = hexToRgb(ann.color);
          const lw = (ann.lineWidth || 2) / FINAL_SCALE;

          // คุณเก็บเป็น points ไม่ใช่ paths
          const pts = ann.points ?? [];
          for (let i = 1; i < pts.length; i++) {
            const sx = pts[i-1].x / FINAL_SCALE;
            const sy = pageH - (pts[i-1].y / FINAL_SCALE);
            const ex = pts[i].x / FINAL_SCALE;
            const ey = pageH - (pts[i].y / FINAL_SCALE);

            page.drawLine({
              start: { x: sx, y: sy },
              end: { x: ex, y: ey },
              thickness: lw,
              color: rgb(r,g,b),
              opacity: ann.type === 'highlight' ? 0.5 : 1,
            });
          }
        }

        if (ann.type === 'image') {
          if (!ann.imageData) continue;
          const bytes = dataURLtoUint8Array(ann.imageData);
          const isPng = ann.imageData.startsWith('data:image/png');
          const img = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);

          const w = (ann.size?.width || img.width) / FINAL_SCALE;
          const h = (ann.size?.height || img.height) / FINAL_SCALE;
          const x = ann.position.x / FINAL_SCALE;
          const y = pageH - (ann.position.y / FINAL_SCALE) - h;

          page.drawImage(img, { x, y, width: w, height: h });
        }

        if (ann.type === 'signature') {
          if (!ann.signatureData) continue;
          const bytes = dataURLtoUint8Array(ann.signatureData);
          const img = await pdfDoc.embedPng(bytes);

          const w = (ann.size?.width || img.width) / FINAL_SCALE;
          const h = (ann.size?.height || img.height) / FINAL_SCALE;
          const x = ann.position.x / FINAL_SCALE;
          const y = pageH - (ann.position.y / FINAL_SCALE) - h;

          page.drawImage(img, { x, y, width: w, height: h });
        }
      }

      const out = await pdfDoc.save();
      saveAs(new Blob([out], { type: 'application/pdf' }), `annotated-${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  };

  const handleToolSelect = (toolType: ToolType) => {
    setSelectedTool(toolType);
    
    // Auto-open signature modal when signature tool is selected
    if (toolType === 'signature') {
      // We'll need to trigger the signature modal from PDFCanvas
      // For now, just set the tool and let PDFCanvas handle the modal
    }
  };

  return (
    <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 border-b-2 border-gray-200 shadow-lg">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
        {/* Tools Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-700 mr-2 px-3 py-1 bg-white rounded-lg shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Tools:
          </span>
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => handleToolSelect(tool.type)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                selectedTool === tool.type
                  ? `bg-gradient-to-r ${tool.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
              title={tool.label}
            >
              <span className="mr-1.5">{tool.icon}</span>
              {tool.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={clearAnnotations}
            className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        {/* Text Settings */}
        {selectedTool === 'text' && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-md">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Size:
              <input
                type="number"
                value={textSettings.fontSize}
                onChange={(e) => updateTextSettings({ fontSize: parseInt(e.target.value) })}
                className="w-16 px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                min="8"
                max="72"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Color:
              <input
                type="color"
                value={textSettings.color}
                onChange={(e) => updateTextSettings({ color: e.target.value })}
                className="w-14 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Font:
              <select
                value={textSettings.fontFamily}
                onChange={(e) => updateTextSettings({ fontFamily: e.target.value })}
                className="px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="TH Sarabun New">TH Sarabun New</option>
                <option value="TH Sarabun">TH Sarabun</option>
              </select>
            </label>
            
            {/* Text Formatting Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Format:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => updateTextSettings({ 
                    fontWeight: textSettings.fontWeight === 'bold' ? 'normal' : 'bold' 
                  })}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                    textSettings.fontWeight === 'bold' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  onClick={() => updateTextSettings({ 
                    fontStyle: textSettings.fontStyle === 'italic' ? 'normal' : 'italic' 
                  })}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                    textSettings.fontStyle === 'italic' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  onClick={() => updateTextSettings({ 
                    textDecoration: textSettings.textDecoration === 'underline' ? 'none' : 'underline' 
                  })}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all ${
                    textSettings.textDecoration === 'underline' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                  title="Underline"
                >
                  <u>U</u>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Draw Settings */}
        {selectedTool === 'draw' && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-md">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Width:
              <input
                type="number"
                value={drawSettings.lineWidth || 2}
                onChange={(e) => updateDrawSettings({ lineWidth: parseInt(e.target.value) || 2 })}
                className="w-16 px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                min="1"
                max="20"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              สี:
              <input
                type="color"
                value={drawSettings.color}
                onChange={(e) => updateDrawSettings({ color: e.target.value })}
                className="w-14 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Highlight Settings */}
        {selectedTool === 'highlight' && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-md">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Width:
              <input
                type="number"
                value={highlightSettings.lineWidth || 10}
                onChange={(e) => updateHighlightSettings({ lineWidth: parseInt(e.target.value) || 10 })}
                className="w-16 px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                min="10"
                max="50"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              สี:
              <input
                type="color"
                value={highlightSettings.color}
                onChange={(e) => updateHighlightSettings({ color: e.target.value })}
                className="w-14 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Page Navigation & Zoom */}
        <div className="flex items-center gap-4 ml-auto">
          {numPages > 0 && (
            <>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  ←
                </button>
                <span className="text-sm font-bold text-gray-700 px-2">
                  Page {currentPage} / {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage === numPages}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  →
                </button>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md">
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-bold text-lg"
                >
                  −
                </button>
                <span className="text-sm font-bold text-gray-700 min-w-[60px] text-center flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-bold text-lg"
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

