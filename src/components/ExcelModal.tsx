import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { ContentItem, ImportError } from '../types/content';
import { downloadExcelTemplate, exportContentToExcel, parseExcelFile } from '../utils/excelUtils';
import { formatWeekRange, getMonthName } from '../utils/dateUtils';

interface ExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContentItem[];
  activeMonday: Date;
  onImportSuccess: (newItems: ContentItem[]) => void;
}

export const ExcelModal: React.FC<ExcelModalProps> = ({
  isOpen,
  onClose,
  items,
  activeMonday,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'template'>('export');
  
  // Export settings
  const [exportScope, setExportScope] = useState<'week' | 'month' | 'all'>('week');
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  // Import state
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<ContentItem[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [importSuccessMessage, setImportSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadExcelTemplate();
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const year = activeMonday.getFullYear();
      const month = activeMonday.getMonth();
      exportContentToExcel(items, exportScope, activeMonday, year, month);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setIsParsing(true);
    setImportErrors([]);
    setParsedItems([]);
    setImportSuccessMessage('');

    try {
      const result = await parseExcelFile(file);
      setParsedItems(result.validItems);
      setImportErrors(result.errors);
    } catch (err) {
      setImportErrors([
        {
          sheet: 'Workbook',
          rowNumber: 0,
          column: 'File',
          error: 'Failed to read Excel file. Please ensure it is a valid .xlsx or .xls document.',
          suggestedCorrection: 'Use the official downloadable template.',
        },
      ]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    onImportSuccess(parsedItems);
    setImportSuccessMessage(`Successfully imported ${parsedItems.length} content items into Content Planner!`);
    setParsedItems([]);
    setImportErrors([]);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 w-full max-w-3xl my-8 overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Excel Integration
              </h2>
              <p className="text-xs text-slate-500">
                Import from spreadsheet, export content schedules, or download templates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
            {parsedItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">
                {parsedItems.length}
              </span>
            )}
            {importErrors.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px]">
                {importErrors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('template')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'template'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                  Select Export Scope
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setExportScope('week')}
                    className={`p-3 rounded border text-left transition-colors ${
                      exportScope === 'week'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">Current Week</span>
                    <span className="text-[11px] text-slate-500">
                      {formatWeekRange(activeMonday)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('month')}
                    className={`p-3 rounded border text-left transition-colors ${
                      exportScope === 'month'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">Current Month</span>
                    <span className="text-[11px] text-slate-500">
                      {getMonthName(activeMonday.getFullYear(), activeMonday.getMonth())}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`p-3 rounded border text-left transition-colors ${
                      exportScope === 'all'
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">All Content</span>
                    <span className="text-[11px] text-slate-500">
                      {items.length} total items in database
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">Export Structure</div>
                <p>
                  The generated file contains two separate sheets: <strong>Instagram</strong> (Reel, Carousel, Photo, Story with briefs &amp; captions) and <strong>Website</strong> (Blog articles with SEO meta, keywords, and outline).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {exportDone && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Export file downloaded successfully!
                    </span>
                  )}
                </div>

                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Generating...' : 'Export to Excel (.xlsx)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 bg-slate-50/50 transition-colors">
                <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-xs font-bold text-slate-900 hover:underline">
                    Click to select Excel file (.xlsx)
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload an Excel workbook formatted with "Instagram" and "Website" sheets
                </p>
                {selectedFileName && (
                  <div className="mt-2 text-xs font-mono font-medium text-slate-800 bg-white inline-block px-2.5 py-1 rounded border border-slate-200">
                    {selectedFileName}
                  </div>
                )}
              </div>

              {isParsing && (
                <div className="py-4 text-center text-xs text-slate-500">
                  Reading workbook and validating columns...
                </div>
              )}

              {importSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* Error Diagnostics Table */}
              {importErrors.length > 0 && (
                <div className="border border-rose-200 rounded-lg overflow-hidden bg-rose-50/30">
                  <div className="p-3 bg-rose-100/50 border-b border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                    <span className="text-xs font-bold text-rose-900">
                      Validation Errors Found ({importErrors.length})
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-rose-50 text-rose-900 border-b border-rose-200 font-semibold">
                          <th className="py-2 px-3">Sheet</th>
                          <th className="py-2 px-3 w-16">Row</th>
                          <th className="py-2 px-3 w-28">Column</th>
                          <th className="py-2 px-3">Error</th>
                          <th className="py-2 px-3">Suggested Correction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {importErrors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-rose-50/60">
                            <td className="py-2 px-3 font-medium text-rose-900">{err.sheet}</td>
                            <td className="py-2 px-3 font-mono tabular-nums">{err.rowNumber || '—'}</td>
                            <td className="py-2 px-3 font-semibold text-rose-800">{err.column}</td>
                            <td className="py-2 px-3 text-rose-700">{err.error}</td>
                            <td className="py-2 px-3 text-slate-700">{err.suggestedCorrection}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2.5 bg-rose-50 border-t border-rose-200 text-[11px] text-rose-800">
                    Fix the spreadsheet rows listed above or verify the data before importing. Invalid rows are excluded.
                  </div>
                </div>
              )}

              {/* Valid Items Preview */}
              {parsedItems.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Valid Records Ready for Import ({parsedItems.length})
                    </span>
                    <span className="text-xs text-slate-500">
                      Review below and click confirm to merge
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Channel</th>
                          <th className="py-2 px-3">Format</th>
                          <th className="py-2 px-3">Title</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-mono text-slate-700">{item.date}</td>
                            <td className="py-1.5 px-3 font-medium">{item.channel}</td>
                            <td className="py-1.5 px-3 text-slate-800">{item.format}</td>
                            <td className="py-1.5 px-3 text-slate-900 truncate max-w-xs">{item.title}</td>
                            <td className="py-1.5 px-3 text-slate-600">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setParsedItems([])}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmImport}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Import ({parsedItems.length} items)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: DOWNLOAD TEMPLATE */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Content Planner Excel Template
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download the official multi-sheet workbook template with predefined headers, sample data, and formatting columns for Instagram and Website Blog.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="border border-slate-200 rounded p-3 bg-white text-xs space-y-1">
                    <span className="font-bold text-purple-700 block">Sheet 1: Instagram</span>
                    <p className="text-[11px] text-slate-500">
                      Date, Format, Title, Pillar, Objective, Status, Creative Brief, Visual Concept, Caption, CTA, Reference, Notes
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded p-3 bg-white text-xs space-y-1">
                    <span className="font-bold text-blue-700 block">Sheet 2: Website</span>
                    <p className="text-[11px] text-slate-500">
                      Date, Title, Keyword, Search Intent, Pillar, Status, Meta Title, Meta Description, Slug, Outline, Article Brief, Article, Notes
                    </p>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template (.xlsx)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
