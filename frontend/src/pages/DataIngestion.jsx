import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, FileSpreadsheet, FileText, UploadCloud } from 'lucide-react';
import { sampleIngestionFiles } from '../data/mockData';
import { extractDocument, runAnalysis, uploadDocumentFile, verifyDocumentExtraction } from '../services/apiClient';
import IoTStreamWidget from '../components/IoTStreamWidget';
import PageIntro from '../components/PageIntro';

export default function DataIngestion() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const acceptedTypes = ['PDF', 'PNG', 'JPG', 'CSV', 'XLSX', 'DOCX'];

  const processFile = async (file) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setExtractionResult(null);
    setNeedsVerification(false);
    try {
      const uploadRes = await uploadDocumentFile(file);
      const docId = uploadRes.document?.id || `doc-${Date.now()}`;
      const extractRes = await extractDocument(docId, file.name, file.name.split('.').pop());
      setExtractionResult(extractRes);
      setVerificationData(extractRes.validation?.sanitizedData || {});
      setNeedsVerification(extractRes.validation?.requiresVerification || false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToAnalysis = async () => {
    setIsProcessing(true);
    try {
      await runAnalysis(verificationData || {}, window.localStorage.getItem('ecomindSurveySessionId'));
      navigate('/analysis');
    } catch {
      navigate('/analysis');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!extractionResult?.extraction?.id) {
      handleProceedToAnalysis();
      return;
    }
    setIsProcessing(true);
    try {
      await verifyDocumentExtraction(extractionResult.extraction.id, verificationData);
      setNeedsVerification(false);
      await handleProceedToAnalysis();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container page-shell">
      <PageIntro kicker="Records" title="Utility bills and meter files">
        Upload what accounts payable already files. Line items are read off the page; you only confirm numbers when they look uncertain.
      </PageIntro>

      <div
        className={`dropzone ${dragActive ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
        }}
        onClick={() => document.getElementById('file-upload-input').click()}
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-upload-input').click()}
        role="button"
        tabIndex={0}
      >
        <input
          id="file-upload-input"
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.docx"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />
        <div className="dropzone-icon"><UploadCloud size={22} /></div>
        <h3 className="dropzone-title">Drop a file here, or browse</h3>
        <p className="text-muted" style={{ fontSize: '0.88rem' }}>Invoices, CSVs, and photos of printouts are all fine.</p>
        <div className="file-types-tags">
          {acceptedTypes.map((type) => <span key={type} className="file-tag">{type}</span>)}
        </div>
      </div>

      {selectedFile && (
        <div className="surface" style={{ marginTop: '1rem', borderColor: needsVerification ? 'var(--color-brass)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
              {needsVerification ? <AlertTriangle size={20} color="var(--color-brass)" /> : <CheckCircle2 size={20} className="text-accent" />}
              <div>
                <p style={{ fontWeight: 600 }}>{selectedFile.name}</p>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {isProcessing ? 'Reading line items…' : extractionResult?.message || 'Ready to calculate'}
                </p>
              </div>
            </div>
            {!needsVerification && (
              <button className="btn btn-primary" onClick={handleProceedToAnalysis} disabled={isProcessing}>
                Run the scorecard
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {needsVerification && verificationData && (
            <div style={{ marginTop: '1rem' }}>
              <p className="field-label">Check these extracted values</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label className="field-label" htmlFor="billing">Billing period</label>
                  <input id="billing" className="field-input" value={verificationData.billing_period || ''} onChange={(e) => setVerificationData((prev) => ({ ...prev, billing_period: e.target.value }))} />
                </div>
                <div>
                  <label className="field-label" htmlFor="kwh">Consumption (kWh)</label>
                  <input id="kwh" className="field-input" type="number" value={verificationData.consumption || 0} onChange={(e) => setVerificationData((prev) => ({ ...prev, consumption: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="field-label" htmlFor="amt">Amount ($)</label>
                  <input id="amt" className="field-input" type="number" value={verificationData.amount || 0} onChange={(e) => setVerificationData((prev) => ({ ...prev, amount: Number(e.target.value) }))} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleConfirmVerification}>Confirm and calculate</button>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2.25rem' }}>
        <h3 className="section-title">Try a sample bill</h3>
        <p className="section-copy">Use these if you just want to walk the rest of the product.</p>
        <div className="example-files-grid">
          {sampleIngestionFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              className="example-file-card"
              onClick={() => processFile({
                name: file.name,
                size: 2400000,
                consumption: file.consumption,
                amount: file.amount
              })}
            >
              {file.type === 'XLSX' || file.type === 'CSV' ? <FileSpreadsheet size={20} /> : <FileText size={20} />}
              <div>
                <div className="example-file-name">{file.name}</div>
                <div className="example-file-meta">{file.category} · {file.size} · ${(file.amount || 0).toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <IoTStreamWidget />
    </div>
  );
}
