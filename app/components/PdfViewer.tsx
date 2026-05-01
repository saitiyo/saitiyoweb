// app/components/PdfViewer.tsx
"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [error, setError] = useState<string | null>(null);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  const onLoadError = useCallback((err: Error) => {
    setError("Failed to load PDF. Try downloading it instead.");
    console.error(err);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 text-center my-auto">
        <FileText size={40} className="text-red-400/60" />
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Page + Zoom controls */}
      <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-2">
        <button
          onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ZoomOut size={13} className="text-white" />
        </button>
        <span className="text-xs text-gray-300 w-12 text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ZoomIn size={13} className="text-white" />
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <button
          onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
          disabled={pageNumber <= 1}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <ChevronLeft size={13} className="text-white" />
        </button>
        <span className="text-xs text-gray-300 w-16 text-center">
          {numPages ? `${pageNumber} / ${numPages}` : "…"}
        </span>
        <button
          onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
          disabled={pageNumber >= numPages}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <ChevronRight size={13} className="text-white" />
        </button>
      </div>

      {/* Document */}
      <Document
        file={fileUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={<Spinner />}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer
          renderAnnotationLayer
          className="shadow-2xl"
          loading={<Spinner />}
        />
        
      </Document>
    </div>
  );
}