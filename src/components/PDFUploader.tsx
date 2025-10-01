'use client';

import { usePDFStore } from '@/store/usePDFStore';
import { PDFDocument } from 'pdf-lib';
import { useState } from 'react';

export default function PDFUploader() {
  const { setPDFFile, setPDFBytes, setNumPages, setCurrentPage } = usePDFStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return;
    }

    setIsLoading(true);
    try {
      setPDFFile(file);
      
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      setPDFBytes(bytes);

      const pdfDoc = await PDFDocument.load(bytes);
      setNumPages(pdfDoc.getPageCount());
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert('ไม่สามารถโหลดไฟล์ PDF กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 sm:p-8 animate-gradient">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 max-w-3xl w-full text-center border border-white/20">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6 animate-bounce-slow">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            PDF Annotator Pro
          </h1>
          <p className="text-gray-600 text-xl font-medium">
            เครื่องมือเขียนคำอธิบายบน PDF แบบมืออาชีพ
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-10 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-inner border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
            <span className="text-3xl">✨</span>
            ฟีเจอร์ที่โดดเด่น
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📝', label: 'เพิ่มข้อความ', color: 'from-blue-500 to-blue-600' },
              { icon: '🖼️', label: 'แทรกรูปภาพ', color: 'from-green-500 to-green-600' },
              { icon: '✍️', label: 'ลายเซ็นดิจิทัล', color: 'from-purple-500 to-purple-600' },
              { icon: '✏️', label: 'วาดและสเก็ตช์', color: 'from-orange-500 to-orange-600' },
              { icon: '🖍️', label: 'ไฮไลต์ข้อความ', color: 'from-yellow-500 to-yellow-600' },
              { icon: '💾', label: 'บันทึก/โหลด', color: 'from-pink-500 to-pink-600' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-default"
              >
                <div className={`text-3xl p-2 bg-gradient-to-br ${feature.color} rounded-lg shadow-md`}>
                  <span className="block transform hover:rotate-12 transition-transform">
                    {feature.icon}
                  </span>
                </div>
                <span className="text-gray-700 font-semibold text-sm sm:text-base">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`border-3 border-dashed rounded-2xl p-10 transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-100 scale-105'
              : 'border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50'
          } hover:border-blue-400 hover:bg-blue-100/50 cursor-pointer group relative overflow-hidden`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="pdf-upload"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center gap-5 relative z-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                {isLoading ? 'กำลังโหลด...' : 'อัพโหลดไฟล์ PDF'}
              </p>
              <p className="text-gray-600 mb-4">
                คลิกที่นี่หรือลากไฟล์มาวางเพื่ออัพโหลด
              </p>
            </div>
            
            <div className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl group-hover:scale-110 transition-all cursor-pointer">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังโหลด...
                </span>
              ) : (
                '🚀 เลือกไฟล์'
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">รองรับ PDF เท่านั้น</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">ปลอดภัย 100%</span>
          </div>
        </div>
        
        <p className="mt-4 text-gray-500 text-sm">
          ไฟล์ของคุณจะถูกประมวลผลในเบราว์เซอร์ - ไม่มีการอัพโหลดไปยังเซิร์ฟเวอร์
        </p>
      </div>
    </div>
  );
}

