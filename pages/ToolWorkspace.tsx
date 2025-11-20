import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TOOLS } from './Home';
import { UploadedFile, ProcessStatus, ToolResult, AddPagesConfig } from '../types';
import { FileUploader, FileListItem, ActionBar, ResultScreen } from '../tools/ToolComponents';
import * as PDFService from '../services/pdfService';
import { ArrowLeft, Plus, Settings } from 'lucide-react';

export const ToolWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tool = TOOLS.find(t => t.id === id);

  // State
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [result, setResult] = useState<ToolResult | null>(null);
  
  // Specific Config States
  const [addPagesConfig, setAddPagesConfig] = useState<AddPagesConfig>({ position: 'end' });
  const [rotation, setRotation] = useState(90);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [password, setPassword] = useState('');
  
  // Split Config
  const [splitRange, setSplitRange] = useState<{start: number, end: number}>({ start: 1, end: 1 });
  
  // Remove Pages Config
  const [removePagesInput, setRemovePagesInput] = useState('');
  
  // Page Number Config
  const [pageNumberPosition, setPageNumberPosition] = useState('b-c'); // b-c = bottom-center

  useEffect(() => {
    // Reset state on tool change
    setFiles([]);
    setStatus('idle');
    setResult(null);
    setPassword('');
    setWatermarkText('CONFIDENTIAL');
    setSplitRange({ start: 1, end: 1 });
    setRemovePagesInput('');
    setPageNumberPosition('b-c');
  }, [id]);

  if (!tool) return <div className="p-12 text-center">Tool not found</div>;

  const handleUpload = (newFiles: File[]) => {
    const uploaded: UploadedFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f
    }));
    if (tool.multiple) {
      setFiles(prev => [...prev, ...uploaded]);
    } else {
      setFiles(uploaded); // Replace if single mode
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setStatus('processing');

    try {
      let blob: Blob | null = null;
      let outName = `exepdf_${tool.id}_result.pdf`;

      const rawFiles = files.map(f => f.file);

      // --- LOGIC DISPATCHER ---
      switch (tool.id) {
        case 'merge-pdf':
          blob = await PDFService.mergePdfs(rawFiles);
          outName = 'merged_document.pdf';
          break;
        case 'split-pdf':
          blob = await PDFService.splitPdf(rawFiles[0], splitRange.start, splitRange.end); 
          outName = `split_${rawFiles[0].name}`;
          break;
        case 'remove-pages':
           const pagesToRemove = removePagesInput.split(',')
             .map(s => parseInt(s.trim()))
             .filter(n => !isNaN(n));
           if(pagesToRemove.length === 0) throw new Error("Enter pages to remove");
           blob = await PDFService.removePages(rawFiles[0], pagesToRemove);
           break;
        case 'add-pages':
           // Requires at least 2 files: Base + Added
           if (rawFiles.length < 2) throw new Error("Need base PDF and pages to add");
           blob = await PDFService.addPagesToPdf(rawFiles[0], rawFiles.slice(1), addPagesConfig);
           outName = `modified_${rawFiles[0].name}`;
           break;
        case 'rotate-pdf':
           blob = await PDFService.rotatePdf(rawFiles[0], rotation);
           break;
        case 'jpg-to-pdf':
           blob = await PDFService.imagesToPdf(rawFiles);
           outName = 'images.pdf';
           break;
        case 'watermark-pdf':
           blob = await PDFService.watermarkPdf(rawFiles[0], watermarkText);
           break;
        case 'protect-pdf':
           if (!password) throw new Error("Password is required");
           blob = await PDFService.protectPdf(rawFiles[0], password);
           outName = `protected_${rawFiles[0].name}`;
           break;
        case 'page-numbers':
           blob = await PDFService.addPageNumbers(rawFiles[0], pageNumberPosition);
           break;
        default:
           // For tools not implemented in client-side demo
           blob = await PDFService.mockConversion(rawFiles[0], 'pdf');
           break;
      }

      if (blob) {
        setResult({ fileName: outName, blob });
        setStatus('success');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      alert("Error processing PDF: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  if (status === 'success' && result) {
    return <ResultScreen fileName={result.fileName} blob={result.blob} onReset={() => { setStatus('idle'); setFiles([]); setResult(null); }} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Tools
      </button>

      <div className="text-center mb-10">
         <div className="inline-flex p-3 rounded-2xl bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 mb-4">
            <tool.icon size={48} />
         </div>
         <h1 className="text-3xl font-bold mb-2">{tool.title}</h1>
         <p className="text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: File Management */}
        <div className="lg:col-span-2 space-y-6">
            {files.length === 0 ? (
                <FileUploader 
                    onUpload={handleUpload} 
                    accept={tool.accepts} 
                    multiple={tool.multiple || tool.id === 'add-pages'} 
                    label={`Drop ${tool.accepts.includes('image') ? 'images' : 'PDFs'} here`}
                />
            ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 min-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">Selected Files ({files.length})</h3>
                        {(tool.multiple || tool.id === 'add-pages') && (
                             <label className="cursor-pointer flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
                                <Plus size={16} /> Add more
                                <input type="file" className="hidden" multiple onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))} accept={tool.accepts} />
                             </label>
                        )}
                    </div>
                    <div className="space-y-2">
                        {files.map((f, idx) => (
                            <FileListItem key={f.id} file={f} index={idx} onRemove={() => removeFile(f.id)} />
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Right: Settings (Contextual) */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Settings size={20} /> Settings
                </div>

                {/* SPLIT PDF SETTINGS */}
                {tool.id === 'split-pdf' && (
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">Start Page</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                    value={splitRange.start}
                                    onChange={(e) => setSplitRange(prev => ({...prev, start: parseInt(e.target.value)}))}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2">End Page</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                    value={splitRange.end}
                                    onChange={(e) => setSplitRange(prev => ({...prev, end: parseInt(e.target.value)}))}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Extracts the range as a new PDF.</p>
                    </div>
                )}

                {/* REMOVE PAGES SETTINGS */}
                {tool.id === 'remove-pages' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium mb-2">Pages to Remove</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 1, 3, 5"
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                            value={removePagesInput}
                            onChange={(e) => setRemovePagesInput(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Comma separated page numbers.</p>
                    </div>
                )}

                {/* ADD PAGES SETTINGS */}
                {tool.id === 'add-pages' && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">The first file is the <strong>Base PDF</strong>. Subsequent files will be inserted.</p>
                        <div>
                            <label className="block text-sm font-medium mb-2">Insert Position</label>
                            <select 
                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                value={addPagesConfig.position}
                                onChange={(e) => setAddPagesConfig({...addPagesConfig, position: e.target.value as any})}
                            >
                                <option value="end">At the end</option>
                                <option value="start">At the beginning</option>
                                <option value="specific">After specific page</option>
                            </select>
                        </div>
                        {addPagesConfig.position === 'specific' && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Page Number</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                    defaultValue={1}
                                    onChange={(e) => setAddPagesConfig({...addPagesConfig, specificIndex: parseInt(e.target.value)})}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* ROTATE SETTINGS */}
                {tool.id === 'rotate-pdf' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium mb-2">Rotation</label>
                        <div className="flex gap-2">
                            {[90, 180, 270].map(deg => (
                                <button 
                                    key={deg}
                                    onClick={() => setRotation(deg)}
                                    className={`flex-1 py-2 rounded-lg border ${rotation === deg ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-slate-200 dark:border-slate-700'}`}
                                >
                                    {deg}°
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* WATERMARK SETTINGS */}
                {tool.id === 'watermark-pdf' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Watermark Text</label>
                        <input 
                            type="text" 
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                        />
                    </div>
                )}

                {/* PAGE NUMBERS SETTINGS */}
                {tool.id === 'page-numbers' && (
                    <div>
                         <label className="block text-sm font-medium mb-2">Position</label>
                         <select 
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                            value={pageNumberPosition}
                            onChange={(e) => setPageNumberPosition(e.target.value)}
                        >
                            <option value="b-c">Bottom Center</option>
                            <option value="b-l">Bottom Left</option>
                            <option value="b-r">Bottom Right</option>
                            <option value="t-c">Top Center</option>
                            <option value="t-l">Top Left</option>
                            <option value="t-r">Top Right</option>
                        </select>
                    </div>
                )}

                {/* PROTECT PDF SETTINGS */}
                {tool.id === 'protect-pdf' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Set Password</label>
                        <input 
                            type="password" 
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent mb-2"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">This password will be required to open the PDF.</p>
                    </div>
                )}

                {/* GENERIC MESSAGE */}
                {['merge-pdf', 'jpg-to-pdf', 'word-to-pdf'].includes(tool.id) && (
                    <p className="text-sm text-slate-500 italic">
                        {tool.id === 'merge-pdf' ? 'Files will be merged in the order listed.' : 
                         tool.id === 'word-to-pdf' ? 'Conversion happens securely.' :
                         'Default settings applied.'}
                    </p>
                )}

                {files.length === 0 && (
                   <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-sm text-center text-slate-500">
                       Upload files to configure options.
                   </div>
                )}
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {files.length > 0 && (
          <ActionBar 
            status={status} 
            onAction={processFiles} 
            actionLabel={tool.id === 'protect-pdf' ? 'Protect PDF' : tool.id === 'merge-pdf' ? 'Merge PDF' : 'Process File'} 
          />
      )}
    </div>
  );
};
