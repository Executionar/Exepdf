import React, { useCallback } from 'react';
import { Upload, File as FileIcon, X, ArrowRight, Plus, Trash2, Settings, Download, Loader2 } from 'lucide-react';
import { UploadedFile, ProcessStatus } from '../types';

// --- FILE UPLOADER ---
export const FileUploader: React.FC<{ 
  onUpload: (files: File[]) => void; 
  accept: string; 
  multiple: boolean;
  label?: string;
}> = ({ onUpload, accept, multiple, label = "Drop PDF files here" }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group
        ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        type="file" 
        accept={accept} 
        multiple={multiple} 
        className="hidden" 
        onChange={handleChange} 
      />
      <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Upload size={32} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-slate-500 dark:text-slate-400">or click to select files</p>
    </div>
  );
};

// --- FILE LIST ITEM ---
export const FileListItem: React.FC<{ 
  file: UploadedFile; 
  onRemove: () => void; 
  index: number;
}> = ({ file, onRemove, index }) => {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg shadow-sm mb-2 animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-10 bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 rounded flex items-center justify-center shrink-0 font-bold text-xs">
          PDF
        </div>
        <div className="truncate">
          <p className="font-medium text-sm truncate max-w-[200px] sm:max-w-xs">{file.file.name}</p>
          <p className="text-xs text-slate-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <button onClick={onRemove} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
        <X size={18} />
      </button>
    </div>
  );
};

// --- ACTION BAR ---
export const ActionBar: React.FC<{
    status: ProcessStatus;
    onAction: () => void;
    actionLabel: string;
    disabled?: boolean;
    secondaryAction?: React.ReactNode;
}> = ({ status, onAction, actionLabel, disabled, secondaryAction }) => {
    return (
        <div className="sticky bottom-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
            <div className="flex-1 w-full sm:w-auto">
                 {/* Optional space for status text or secondary controls */}
                 {secondaryAction}
            </div>
            <button 
                onClick={onAction}
                disabled={disabled || status === 'processing'}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20
                ${disabled || status === 'processing' 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-brand-600 hover:bg-brand-700 text-white hover:scale-105 active:scale-95'}`}
            >
                {status === 'processing' ? (
                    <><Loader2 className="animate-spin" /> Processing...</>
                ) : (
                    <>{actionLabel} <ArrowRight size={18} /></>
                )}
            </button>
        </div>
    );
};

// --- RESULT SCREEN ---
export const ResultScreen: React.FC<{
    fileName: string;
    blob: Blob;
    onReset: () => void;
}> = ({ fileName, blob, onReset }) => {
    const handleDownload = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                <Download size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-2">Task Completed!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                Your file <strong>{fileName}</strong> is ready. It has been processed locally on your device.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button 
                    onClick={handleDownload}
                    className="flex-1 bg-brand-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                    <Download size={18} /> Download File
                </button>
                <button 
                    onClick={onReset}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Process Another
                </button>
            </div>
        </div>
    );
};