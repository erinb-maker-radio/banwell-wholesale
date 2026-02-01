'use client';

import { useState, useRef } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface CsvRow {
  sku: string;
  section: string;
  title: string;
  imageUrl: string;
}

interface ImportResult {
  imported: number;
  errors: number;
  details: string[];
}

export default function ImportProductsPage() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseCsv(text: string): CsvRow[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);
    const parsed: CsvRow[] = [];

    for (const line of dataLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Handle quoted fields with commas inside
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());

      if (fields.length >= 4) {
        parsed.push({
          sku: fields[0],
          section: fields[1],
          title: fields[2],
          imageUrl: fields[3],
        });
      }
    }

    return parsed;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsv(text);
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (rows.length === 0) return;

    setImporting(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: rows }),
      });

      setProgress(100);
      const json = await res.json();

      if (json.success) {
        setResult({
          imported: json.data.imported || 0,
          errors: json.data.errors || 0,
          details: json.data.details || [],
        });
      } else {
        setError(json.error || 'Import failed');
      }
    } catch (err) {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setRows([]);
    setFileName('');
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const previewRows = rows.slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Import Products"
        description="Upload CSV to import products"
      />

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Expected CSV format: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">sku,section,title,imageUrl</code>
            </p>

            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {rows.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Clear
                </Button>
              )}
            </div>

            {fileName && (
              <p className="text-sm text-gray-600">
                File: <span className="font-medium">{fileName}</span> — {rows.length} rows parsed
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {previewRows.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Preview {rows.length > 10 ? `(first 10 of ${rows.length})` : `(${rows.length} rows)`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewRows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{row.sku}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{row.section}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 max-w-xs truncate">{row.title}</td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{row.imageUrl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button + Progress */}
      {rows.length > 0 && !result && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="space-y-4">
              {importing && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? 'Importing...' : `Import ${rows.length} Products`}
                </Button>
                {importing && (
                  <span className="text-sm text-gray-500">Processing...</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{result.imported}</p>
                  <p className="text-sm text-gray-500">Products Imported</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{result.errors}</p>
                  <p className="text-sm text-gray-500">Errors</p>
                </div>
              </div>

              {result.details.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Details:</p>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-48 overflow-y-auto">
                    {result.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-gray-400">-</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button onClick={handleReset}>Import More</Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/admin/products'}
                >
                  View Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
