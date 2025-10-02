'use client';

import { useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { usePDFStore } from '@/store/usePDFStore';
import { TextAnnotation, ImageAnnotation, SignatureAnnotation } from '@/types';

interface DraggableAnnotationProps {
  annotation: TextAnnotation | ImageAnnotation | SignatureAnnotation;
}

export default function DraggableAnnotation({ annotation }: DraggableAnnotationProps) {
  const { updateAnnotation, deleteAnnotation, selectedAnnotationId, setSelectedAnnotationId } = usePDFStore();
  // Auto-edit mode for new empty text annotations
  const [isEditing, setIsEditing] = useState(
    annotation.type === 'text' && annotation.text === ''
  );
  const [editText, setEditText] = useState(annotation.type === 'text' ? annotation.text : '');
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const isSelected = selectedAnnotationId === annotation.id;

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    updateAnnotation(annotation.id, {
      position: { x: data.x, y: data.y },
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAnnotationId(annotation.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (annotation.type === 'text') {
      setIsEditing(true);
    }
  };

  const handleTextSave = () => {
    if (annotation.type === 'text') {
      updateAnnotation(annotation.id, { text: editText });
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnnotation(annotation.id);
  };

  const handleResize = (e: React.MouseEvent, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    if (annotation.type !== 'image' && annotation.type !== 'signature') return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = annotation.size.width;
    const startHeight = annotation.size.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      // Calculate new size based on direction
      if (direction === 'se') {
        newWidth = Math.max(20, startWidth + deltaX);
        newHeight = Math.max(20, startHeight + deltaY);
      } else if (direction === 'sw') {
        newWidth = Math.max(20, startWidth - deltaX);
        newHeight = Math.max(20, startHeight + deltaY);
      } else if (direction === 'ne') {
        newWidth = Math.max(20, startWidth + deltaX);
        newHeight = Math.max(20, startHeight - deltaY);
      } else if (direction === 'nw') {
        newWidth = Math.max(20, startWidth - deltaX);
        newHeight = Math.max(20, startHeight - deltaY);
      }
      
      updateAnnotation(annotation.id, {
        size: { width: newWidth, height: newHeight }
      });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: annotation.position.x, y: annotation.position.y }}
      onStop={handleDragStop}
      disabled={isEditing} // Disable dragging while editing
      axis="both"
      defaultClassName="draggable-annotation"
    >
      <div
        ref={nodeRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`absolute ${isEditing ? 'cursor-text' : 'cursor-move'} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        style={{ 
          touchAction: 'none', 
          zIndex: isEditing ? 1000 : isSelected ? 100 : 1,
          left: 0,
          top: 0,
        }}
      >
        {/* Text Annotation */}
        {annotation.type === 'text' && (
          <div className="relative group">
            {isEditing ? (
              <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-2xl border-3 border-blue-500 backdrop-blur-sm">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={handleTextSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextSave();
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditText(annotation.text);
                    }
                  }}
                  autoFocus
                  placeholder="พิมพ์ข้อความที่นี่..."
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-w-[300px] bg-white shadow-inner"
                  style={{
                    fontSize: `${annotation.fontSize}px`,
                    fontFamily: annotation.fontFamily,
                    color: annotation.color,
                    fontWeight: annotation.fontWeight,
                    fontStyle: annotation.fontStyle,
                    textDecoration: annotation.textDecoration,
                  }}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-600 font-semibold">✏️ กำลังแก้ไข</span>
                  <span className="text-gray-500">กด Enter เพื่อบันทึก | Esc ยกเลิก</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: `${annotation.fontSize}px`,
                  color: annotation.color,
                  fontFamily: annotation.fontFamily,
                  fontWeight: annotation.fontWeight,
                  fontStyle: annotation.fontStyle,
                  textDecoration: annotation.textDecoration,
                }}
                className="whitespace-nowrap select-none"
              >
                {annotation.text || '✏️ ดับเบิ้ลคลิกเพื่อแก้ไข'}
              </div>
            )}
            {isSelected && !isEditing && (
              <button
                onClick={handleDelete}
                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-red-600 shadow-lg transition-all hover:scale-110"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Image Annotation */}
        {annotation.type === 'image' && (
          <div className="relative group">
            <img
              src={annotation.imageData}
              alt="Annotation"
              style={{
                width: annotation.size.width,
                height: annotation.size.height,
              }}
              className="pointer-events-none select-none border-transparent"
            />
            {isSelected && (
              <>
                {/* Delete Button */}
                <button
                  onClick={handleDelete}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  ×
                </button>
                
                {/* Resize Handles */}
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed opacity-50 pointer-events-none"></div>
                
                {/* Top-left resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize hover:bg-blue-600"
                  style={{ top: -6, left: -6 }}
                  onMouseDown={(e) => handleResize(e, 'nw')}
                />
                
                {/* Top-right resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize hover:bg-blue-600"
                  style={{ top: -6, right: -6 }}
                  onMouseDown={(e) => handleResize(e, 'ne')}
                />
                
                {/* Bottom-left resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize hover:bg-blue-600"
                  style={{ bottom: -6, left: -6 }}
                  onMouseDown={(e) => handleResize(e, 'sw')}
                />
                
                {/* Bottom-right resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize hover:bg-blue-600"
                  style={{ bottom: -6, right: -6 }}
                  onMouseDown={(e) => handleResize(e, 'se')}
                />
              </>
            )}
          </div>
        )}

        {/* Signature Annotation */}
        {annotation.type === 'signature' && (
          <div className="relative group">
            <img
              src={annotation.signatureData}
              alt="Signature"
              style={{
                width: annotation.size.width,
                height: annotation.size.height,
              }}
              className="pointer-events-none select-none border-transparent"
            />
            {isSelected && (
              <>
                {/* Delete Button */}
                <button
                  onClick={handleDelete}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  ×
                </button>
                
                {/* Resize Handles - No border for signature */}
                {/* Top-left resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize hover:bg-blue-600"
                  style={{ top: -6, left: -6 }}
                  onMouseDown={(e) => handleResize(e, 'nw')}
                />
                
                {/* Top-right resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize hover:bg-blue-600"
                  style={{ top: -6, right: -6 }}
                  onMouseDown={(e) => handleResize(e, 'ne')}
                />
                
                {/* Bottom-left resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize hover:bg-blue-600"
                  style={{ bottom: -6, left: -6 }}
                  onMouseDown={(e) => handleResize(e, 'sw')}
                />
                
                {/* Bottom-right resize handle */}
                <div
                  className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize hover:bg-blue-600"
                  style={{ bottom: -6, right: -6 }}
                  onMouseDown={(e) => handleResize(e, 'se')}
                />
              </>
            )}
          </div>
        )}
      </div>
    </Draggable>
  );
}

