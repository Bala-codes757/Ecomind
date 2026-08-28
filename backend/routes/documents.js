import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import xlsx from 'xlsx';
import upload from '../middleware/upload.js';
import db from '../config/db.js';
import { extractDocumentMetrics } from '../services/aiService.js';
import { validateExtraction } from '../services/validationEngine.js';

const router = express.Router();

async function extractTextFromDocument(document) {
  const extension = path.extname(document.file_name).toLowerCase();
  if (['.png', '.jpg', '.jpeg'].includes(extension)) {
    const error = new Error('Image OCR not yet supported');
    error.status = 422;
    throw error;
  }

  const fileBuffer = await fs.readFile(document.file_path);
  if (extension === '.pdf') {
    const parser = new PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }
  if (extension === '.docx') {
    return (await mammoth.extractRawText({ buffer: fileBuffer })).value;
  }
  if (extension === '.csv') {
    return fileBuffer.toString('utf8');
  }
  if (extension === '.xlsx') {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    return workbook.SheetNames
      .map((sheetName) => xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]))
      .join('\n');
  }

  const error = new Error(`Unsupported document type: ${extension || 'unknown'}`);
  error.status = 422;
  throw error;
}

// 1. Upload Document
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const doc = db.insert('documents', {
      org_id: '11111111-1111-1111-1111-111111111111',
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.originalname.split('.').pop().toUpperCase(),
      file_size_bytes: req.file.size,
      status: 'uploaded'
    });

    res.json({
      success: true,
      document: doc,
      message: 'Document uploaded successfully'
    });
  } catch (err) {
    next(err);
  }
});

// 2. AI Document Extraction + Data Validation Pipeline
router.post('/extract', async (req, res, next) => {
  try {
    const { document_id, file_name, file_type } = req.body;
    const document = document_id ? db.getById('documents', document_id) : null;
    if (!document) {
      return res.status(404).json({ error: 'NotFound', resource: 'document', id: document_id });
    }

    const textContent = await extractTextFromDocument(document);
    if (!textContent.trim()) {
      return res.status(422).json({ success: false, error: 'Document extraction produced no text' });
    }

    const rawExtraction = await extractDocumentMetrics({
      fileName: file_name || document.file_name,
      fileType: file_type || document.file_type,
      textContent
    });

    // Run strict backend validation pipeline
    const validationResult = validateExtraction(rawExtraction);

    const extractionRecord = db.insert('document_extractions', {
      document_id: document_id || `doc-${Date.now()}`,
      raw_json: validationResult.sanitizedData,
      ai_used: rawExtraction.usedAIFallback === false,
      confidence_score: validationResult.confidenceScore,
      validation_status: validationResult.validationStatus,
      verified_by_user: false
    });

    if (document_id) {
      db.update('documents', document_id, { status: 'extracted' });
    }

    res.json({
      success: true,
      extraction: extractionRecord,
      ai_used: extractionRecord.ai_used,
      validation: validationResult,
      message: validationResult.requiresVerification
        ? '5 values need verification'
        : 'Data extracted and validated successfully'
    });
  } catch (err) {
    next(err);
  }
});

// 3. Verify Extracted Data by User
router.post('/verify', async (req, res, next) => {
  try {
    const { extraction_id, verified_data } = req.body;
    const extraction = db.getById('document_extractions', extraction_id);
    if (!extraction) {
      return res.status(404).json({ error: 'NotFound', resource: 'document_extraction', id: extraction_id });
    }
    const updated = db.update('document_extractions', extraction_id, {
      raw_json: verified_data,
      validation_status: 'user_verified',
      verified_by_user: true
    });

    res.json({
      success: true,
      extraction: updated,
      message: 'Extracted values verified successfully'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
