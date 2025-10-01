'use client';

import { usePDFStore } from '@/store/usePDFStore';
import PDFUploader from '@/components/PDFUploader';
import Toolbar from '@/components/Toolbar';
import dynamic from 'next/dynamic';

// Import PDFCanvas with no SSR to avoid DOMMatrix error
const PDFCanvas = dynamic(() => import('@/components/PDFCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-20">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">กำลังเตรียม Canvas...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const { pdfFile } = usePDFStore();

  if (!pdfFile) {
    return <PDFUploader />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Toolbar />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-center">
          <PDFCanvas />
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 text-center text-sm shadow-lg">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <strong className="flex items-center gap-1">
            💡 เคล็ดลับ:
          </strong>
          <span>ดับเบิ้ลคลิกที่ข้อความเพื่อแก้ไข</span>
          <span className="text-blue-200">|</span>
          <span>ใช้เครื่องมือเลือกเพื่อย้ายตำแหน่ง</span>
          <span className="text-blue-200">|</span>
          <span>โฮเวอร์เพื่อลบ</span>
          <span className="text-blue-200">|</span>
          <span>อย่าลืมบันทึกงานของคุณ 💾</span>
        </p>
      </div>
    </div>
  );
}
