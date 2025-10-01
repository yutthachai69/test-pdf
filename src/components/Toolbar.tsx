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
    exportProject,
    importProject,
    clearAnnotations,
    scale,
    setScale,
    currentPage,
    setCurrentPage,
    numPages,
  } = usePDFStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools: { type: ToolType; icon: string; label: string; color: string }[] = [
    { type: 'select', icon: '🖱️', label: 'เลือก', color: 'from-gray-500 to-gray-600' },
    { type: 'text', icon: '📝', label: 'ข้อความ', color: 'from-blue-500 to-blue-600' },
    { type: 'image', icon: '🖼️', label: 'รูปภาพ', color: 'from-green-500 to-green-600' },
    { type: 'signature', icon: '✍️', label: 'ลายเซ็น', color: 'from-purple-500 to-purple-600' },
    { type: 'draw', icon: '✏️', label: 'วาด', color: 'from-orange-500 to-orange-600' },
    { type: 'highlight', icon: '🖍️', label: 'ไฮไลต์', color: 'from-yellow-500 to-yellow-600' },
    { type: 'eraser', icon: '🧹', label: 'ลบ', color: 'from-red-500 to-red-600' },
  ];

  const handleSaveProject = () => {
    const data = exportProject();
    const blob = new Blob([data], { type: 'application/json' });
    saveAs(blob, `pdf-annotations-${Date.now()}.json`);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result as string;
        importProject(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white via-blue-50 to-purple-50 border-b-2 border-gray-200 shadow-lg">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 gap-4 flex-wrap">
        {/* Tools Section */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-700 mr-2 px-3 py-1 bg-white rounded-lg shadow-sm">🛠️ เครื่องมือ:</span>
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => setSelectedTool(tool.type)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                selectedTool === tool.type
                  ? `bg-gradient-to-r ${tool.color} text-white shadow-lg scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
              title={tool.label}
            >
              <span className="mr-1.5 text-base">{tool.icon}</span>
              {tool.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveProject}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            💾 บันทึก
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📂 โหลด
          </button>
          <button
            onClick={clearAnnotations}
            className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🗑️ ลบทั้งหมด
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadProject}
            className="hidden"
          />
        </div>
      </div>

      {/* Settings Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
        {/* Text Settings */}
        {selectedTool === 'text' && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-md">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📏 ขนาด:
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
              🎨 สี:
              <input
                type="color"
                value={textSettings.color}
                onChange={(e) => updateTextSettings({ color: e.target.value })}
                className="w-14 h-10 border-2 border-gray-300 rounded-lg cursor-pointer"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              ✍️ ฟอนต์:
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
              </select>
            </label>
          </div>
        )}

        {/* Draw Settings */}
        {selectedTool === 'draw' && (
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-md">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📏 ความหนา:
              <input
                type="number"
                value={drawSettings.lineWidth}
                onChange={(e) => updateDrawSettings({ lineWidth: parseInt(e.target.value) })}
                className="w-16 px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                min="1"
                max="20"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🎨 สี:
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
              📏 ความหนา:
              <input
                type="number"
                value={highlightSettings.lineWidth}
                onChange={(e) => updateHighlightSettings({ lineWidth: parseInt(e.target.value) })}
                className="w-16 px-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-bold"
                min="10"
                max="50"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              🎨 สี:
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
                  หน้า {currentPage} / {numPages}
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
                <span className="text-sm font-bold text-gray-700 min-w-[60px] text-center">
                  🔍 {Math.round(scale * 100)}%
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

