import { LucideIcon } from 'lucide-react';

export type ToolCategory = 'organize' | 'optimize' | 'convert-to' | 'convert-from' | 'edit';

export interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  isNew?: boolean;
  accepts: string; // mime types
  multiple: boolean;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl?: string;
  pageCount?: number; // Mocked for non-PDFs
}

export type ProcessStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface ToolActionProps {
  files: UploadedFile[];
  onProcess: (config: any) => Promise<void>;
  status: ProcessStatus;
  onRemove: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export interface AddPagesConfig {
  position: 'start' | 'end' | 'specific';
  specificIndex?: number;
}

export interface ToolResult {
  fileName: string;
  blob: Blob;
}