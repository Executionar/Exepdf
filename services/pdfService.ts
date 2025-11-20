import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import { AddPagesConfig } from '../types';

// Helper to read file as ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// --- CORE FUNCTIONS ---

export const mergePdfs = async (files: File[]): Promise<Blob> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const buffer = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(buffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const splitPdf = async (file: File, rangeStart: number, rangeEnd: number): Promise<Blob> => {
  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(buffer);
  const newPdf = await PDFDocument.create();

  // pdf-lib uses 0-based index, UI usually 1-based
  const totalPages = pdf.getPageCount();
  const start = Math.max(0, rangeStart - 1);
  const end = Math.min(totalPages - 1, rangeEnd - 1);

  if (start > end) throw new Error(`Invalid range. Max pages: ${totalPages}`);

  const rangeIndices = [];
  for (let i = start; i <= end; i++) rangeIndices.push(i);

  const copiedPages = await newPdf.copyPages(pdf, rangeIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const removePages = async (file: File, pagesToRemove: number[]): Promise<Blob> => {
    const buffer = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(buffer);
    const pageCount = pdf.getPageCount();
    
    // pdf-lib removePage takes an index.
    // We must remove from highest index to lowest to avoid shifting indices affecting subsequent removals.
    // pagesToRemove should be 1-based from UI, convert to 0-based.
    
    const indices = pagesToRemove
        .map(p => p - 1)
        .filter(i => i >= 0 && i < pageCount)
        .sort((a, b) => b - a); // Descending
        
    // Remove duplicates
    const uniqueIndices = [...new Set(indices)];
    
    if (uniqueIndices.length === pageCount) {
        throw new Error("Cannot remove all pages from the PDF");
    }

    for (const idx of uniqueIndices) {
        pdf.removePage(idx);
    }
    
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const rotatePdf = async (file: File, rotationAmount: number): Promise<Blob> => {
  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(buffer);
  const pages = pdf.getPages();
  
  pages.forEach(page => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAmount) % 360));
  });

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const addPagesToPdf = async (baseFile: File, filesToAdd: File[], config: AddPagesConfig): Promise<Blob> => {
  const baseBuffer = await readFileAsArrayBuffer(baseFile);
  const basePdf = await PDFDocument.load(baseBuffer);
  const pageCount = basePdf.getPageCount();

  let insertIndex = 0;
  if (config.position === 'end') insertIndex = pageCount;
  else if (config.position === 'specific') insertIndex = Math.min(pageCount, Math.max(0, (config.specificIndex || 1) - 1));

  const pagesToInsert: any[] = [];
  
  // Helper to get pages from a file (PDF or Image)
  for (const file of filesToAdd) {
    if (file.type === 'application/pdf') {
        const buffer = await readFileAsArrayBuffer(file);
        const doc = await PDFDocument.load(buffer);
        const copied = await basePdf.copyPages(doc, doc.getPageIndices());
        pagesToInsert.push(...copied);
    } else if (file.type.startsWith('image/')) {
        const buffer = await readFileAsArrayBuffer(file);
        let image;
        if (file.type === 'image/png') image = await basePdf.embedPng(buffer);
        else image = await basePdf.embedJpg(buffer); // basic jpg support
        
        // Alternative: Create a temp doc for the image
        const tempDoc = await PDFDocument.create();
        const page = tempDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        const copied = await basePdf.copyPages(tempDoc, [0]);
        pagesToInsert.push(copied[0]);
    }
  }

  // Insert them
  let currentIndex = insertIndex;
  for (const page of pagesToInsert) {
    basePdf.insertPage(currentIndex, page);
    currentIndex++;
  }

  const pdfBytes = await basePdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const imagesToPdf = async (files: File[]): Promise<Blob> => {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const buffer = await readFileAsArrayBuffer(file);
    let image;
    try {
        if (file.type === 'image/png') {
            image = await pdf.embedPng(buffer);
        } else {
            image = await pdf.embedJpg(buffer);
        }
        
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    } catch (e) {
        console.error("Failed to embed image", file.name);
    }
  }

  const pdfBytes = await pdf.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const watermarkPdf = async (file: File, text: string): Promise<Blob> => {
    const buffer = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(buffer);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);

    pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(text, {
            x: width / 2 - (text.length * 15) / 2, // Rough centering
            y: height / 2,
            size: 50,
            font: font,
            color: rgb(0.7, 0.7, 0.7),
            opacity: 0.5,
            rotate: degrees(45),
        });
    });
    
    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const addPageNumbers = async (file: File, position: string): Promise<Blob> => {
    const buffer = await readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(buffer);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();
    const total = pages.length;

    pages.forEach((page, idx) => {
        const { width, height } = page.getSize();
        const text = `${idx + 1} / ${total}`;
        const textSize = 12;
        const textWidth = font.widthOfTextAtSize(text, textSize);
        
        let x = 50;
        let y = 30;

        // Simple positioning logic
        switch(position) {
            case 'b-c': x = (width - textWidth) / 2; y = 30; break;
            case 'b-l': x = 30; y = 30; break;
            case 'b-r': x = width - textWidth - 30; y = 30; break;
            case 't-c': x = (width - textWidth) / 2; y = height - 30; break;
            case 't-l': x = 30; y = height - 30; break;
            case 't-r': x = width - textWidth - 30; y = height - 30; break;
        }

        page.drawText(text, {
            x,
            y,
            size: textSize,
            font,
            color: rgb(0, 0, 0),
        });
    });

    const pdfBytes = await pdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};

export const protectPdf = async (file: File, password: string): Promise<Blob> => {
  const buffer = await readFileAsArrayBuffer(file);
  const pdf = await PDFDocument.load(buffer);

  // pdf-lib saves with encryption if userPassword is provided in save options
  const pdfBytes = await pdf.save({
    userPassword: password,
    ownerPassword: password, 
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: false,
      documentAssembly: false,
    }
  });
  
  return new Blob([pdfBytes], { type: 'application/pdf' });
};

// Mock for tools that require complex server-side processing (OCR, Office conversion)
// In a real fully local app, you'd use WASM libraries like Tesseract.js or mammoth.js
export const mockConversion = async (file: File, targetFormat: string): Promise<Blob> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const buffer = await readFileAsArrayBuffer(file);
    
    // For demo, just return the original file but pretending it's converted
    return new Blob([buffer], { type: file.type }); 
};
