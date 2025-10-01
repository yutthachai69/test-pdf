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
                }}
                className="whitespace-nowrap bg-white/90 backdrop-blur-sm select-none px-3 py-2 rounded-lg shadow-md border-2 border-gray-200"
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
              className="pointer-events-none select-none"
            />
            {isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
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
              className="pointer-events-none select-none"
            />
            {isSelected && (
              <button
                onClick={handleDelete}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>
    </Draggable>
  );
}

