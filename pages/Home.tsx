import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Files, Scissors, Layout, Trash, FilePlus, RotateCw, FileX, Minimize2, Wrench, 
  Image, FileText, Table, Presentation, Globe, Type, Lock, Eraser, Crop, Eye 
} from 'lucide-react';
import { ToolDef } from '../types';

const TOOLS: ToolDef[] = [
  // Organize
  { id: 'merge-pdf', title: 'Merge PDF', description: 'Combine PDFs in the order you want.', icon: Files, category: 'organize', accepts: '.pdf', multiple: true },
  { id: 'split-pdf', title: 'Split PDF', description: 'Separate one page or a whole set.', icon: Scissors, category: 'organize', accepts: '.pdf', multiple: false },
  { id: 'add-pages', title: 'Add Pages', description: 'Insert pages into a PDF file.', icon: FilePlus, category: 'organize', isNew: true, accepts: '.pdf', multiple: false },
  { id: 'remove-pages', title: 'Remove Pages', description: 'Select pages you want to remove.', icon: Trash, category: 'organize', accepts: '.pdf', multiple: false },
  { id: 'rotate-pdf', title: 'Rotate PDF', description: 'Rotate your PDF pages.', icon: RotateCw, category: 'organize', accepts: '.pdf', multiple: false },
  
  // Optimize
  { id: 'compress-pdf', title: 'Compress PDF', description: 'Reduce file size while optimizing quality.', icon: Minimize2, category: 'optimize', accepts: '.pdf', multiple: false },
  { id: 'repair-pdf', title: 'Repair PDF', description: 'Fix damage and recover data.', icon: Wrench, category: 'optimize', accepts: '.pdf', multiple: false },

  // Convert To PDF
  { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Convert JPG images to PDF.', icon: Image, category: 'convert-to', accepts: 'image/jpeg, image/png', multiple: true },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Convert DOCX to PDF.', icon: FileText, category: 'convert-to', accepts: '.docx', multiple: false },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Convert XLSX spreadsheets to PDF.', icon: Table, category: 'convert-to', accepts: '.xlsx', multiple: false },
  { id: 'ppt-to-pdf', title: 'PowerPoint to PDF', description: 'Convert PPTX to PDF.', icon: Presentation, category: 'convert-to', accepts: '.pptx', multiple: false },

  // Convert From PDF
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Extract images from PDF.', icon: Image, category: 'convert-from', accepts: '.pdf', multiple: false },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDF to editable Word.', icon: FileText, category: 'convert-from', accepts: '.pdf', multiple: false },
  
  // Edit
  { id: 'watermark-pdf', title: 'Watermark', description: 'Stamp an image or text over PDF.', icon: Type, category: 'edit', accepts: '.pdf', multiple: false },
  { id: 'page-numbers', title: 'Page Numbers', description: 'Add page numbers into PDF.', icon: Layout, category: 'edit', accepts: '.pdf', multiple: false },
  { id: 'protect-pdf', title: 'Protect PDF', description: 'Encrypt your PDF with a password.', icon: Lock, category: 'edit', accepts: '.pdf', multiple: false },
];

export const HomePage: React.FC = () => {
  const categories = {
    organize: 'Organize PDF',
    optimize: 'Optimize PDF',
    'convert-to': 'Convert to PDF',
    'convert-from': 'Convert from PDF',
    edit: 'Edit & Security'
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
          Every tool you need to manage PDFs
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Your fast, secure, and fully local PDF solution. No server uploads, no waiting, no limits.
        </p>
      </div>

      <div className="space-y-12">
        {(Object.keys(categories) as Array<keyof typeof categories>).map((catKey) => (
          <div key={catKey}>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200 border-l-4 border-brand-500 pl-4">
              {categories[catKey]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {TOOLS.filter(t => t.category === catKey).map(tool => (
                <Link 
                  to={`/tool/${tool.id}`} 
                  key={tool.id}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-50 to-transparent dark:from-brand-900/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
                  
                  <div className="mb-4 text-brand-600 dark:text-brand-500">
                    <tool.icon size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>
                  {tool.isNew && (
                    <span className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      New
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { TOOLS };