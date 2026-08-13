"use client";

import React, { useCallback } from "react";

interface FileUploadProps {
  id: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export default function FileUpload({
  id,
  file,
  onFileSelect,
  error,
}: FileUploadProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null;
      onFileSelect(selected);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const dropped = e.dataTransfer.files?.[0] ?? null;
      onFileSelect(dropped);
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
          error
            ? "border-red-400 bg-red-50"
            : "border-zinc-300 bg-white hover:border-zinc-400"
        }`}
      >
        <input
          id={id}
          name={id}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="sr-only"
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
        />
        <label
          htmlFor={id}
          className="absolute inset-0 cursor-pointer rounded-lg"
          aria-label="CV dosyası seç"
        />
        {file ? (
          <div className="pointer-events-none relative z-10">
            <p className="text-sm font-medium text-zinc-800">{file.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {formatSize(file.size)}
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Değiştirmek için tıklayın veya yeni dosya sürükleyin
            </p>
          </div>
        ) : (
          <div className="pointer-events-none relative z-10">
            <p className="text-sm text-zinc-600">
              PDF dosyasını sürükleyin veya seçmek için tıklayın
            </p>
          </div>
        )}
      </div>
      <p id={`${id}-hint`} className="text-xs text-zinc-500">
        Sadece PDF, en fazla 5 MB.
      </p>
    </div>
  );
}
