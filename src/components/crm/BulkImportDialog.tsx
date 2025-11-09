import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Papa from "papaparse";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedData {
  headers: string[];
  rows: any[];
}

interface ColumnMapping {
  [csvColumn: string]: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const FIELD_MAPPINGS = [
  { value: "name", label: "Name *" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "company", label: "Company" },
  { value: "position", label: "Position" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "notes", label: "Notes" },
  { value: "skip", label: "Skip Column" },
];

export function BulkImportDialog({ open, onOpenChange, onImportComplete }: BulkImportDialogProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "complete">("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [isDragging, setIsDragging] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const rows = results.data.slice(1).filter((row: any) => 
            row.some((cell: any) => cell && cell.toString().trim() !== '')
          );
          
          setParsedData({ headers, rows });
          
          // Auto-map columns based on header names
          const autoMapping: ColumnMapping = {};
          headers.forEach((header) => {
            const normalized = header.toLowerCase().trim();
            if (normalized.includes('name')) autoMapping[header] = 'name';
            else if (normalized.includes('email')) autoMapping[header] = 'email';
            else if (normalized.includes('phone') || normalized.includes('mobile')) autoMapping[header] = 'phone';
            else if (normalized.includes('company') || normalized.includes('organisation')) autoMapping[header] = 'company';
            else if (normalized.includes('position') || normalized.includes('title') || normalized.includes('role')) autoMapping[header] = 'position';
            else if (normalized.includes('status')) autoMapping[header] = 'status';
            else if (normalized.includes('priority')) autoMapping[header] = 'priority';
            else if (normalized.includes('note')) autoMapping[header] = 'notes';
            else autoMapping[header] = 'skip';
          });
          
          setColumnMapping(autoMapping);
          setStep("mapping");
        }
      },
      error: (error) => {
        toast({
          title: "Parse Error",
          description: `Failed to parse CSV: ${error.message}`,
          variant: "destructive",
        });
      },
    });
  };

  const validateData = (): boolean => {
    if (!parsedData) return false;
    
    // Check if 'name' is mapped (required field)
    const hasNameMapping = Object.values(columnMapping).includes('name');
    if (!hasNameMapping) {
      toast({
        title: "Mapping Error",
        description: "Name is a required field and must be mapped.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleImport = async () => {
    if (!parsedData || !validateData()) return;

    setStep("importing");
    setImportProgress(0);

    const results: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const totalRows = parsedData.rows.length;
    const batchSize = 50; // Process in batches for better performance

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to import contacts.",
          variant: "destructive",
        });
        setStep("mapping");
        return;
      }

      for (let i = 0; i < totalRows; i += batchSize) {
        const batch = parsedData.rows.slice(i, Math.min(i + batchSize, totalRows));
        const contactsToInsert = [];

        for (const row of batch) {
          try {
            const contact: any = {};
            
            parsedData.headers.forEach((header, index) => {
              const mappedField = columnMapping[header];
              if (mappedField && mappedField !== 'skip' && row[index]) {
                contact[mappedField] = row[index].toString().trim();
              }
            });

            // Validate required fields
            if (!contact.name) {
              results.failed++;
              results.errors.push(`Row ${i + batch.indexOf(row) + 2}: Missing required field 'name'`);
              continue;
            }

            // Set defaults
            contact.status = contact.status || 'active';
            contact.priority = contact.priority || 'medium';
            contact.user_id = user.id;

            contactsToInsert.push(contact);
          } catch (error) {
            results.failed++;
            results.errors.push(`Row ${i + batch.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Insert batch
        if (contactsToInsert.length > 0) {
          const { data, error } = await supabase
            .from('crm_contacts')
            .insert(contactsToInsert)
            .select();

          if (error) {
            results.failed += contactsToInsert.length;
            results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          } else {
            results.success += data?.length || 0;
          }
        }

        setImportProgress(Math.round(((i + batch.length) / totalRows) * 100));
      }

      setImportResult(results);
      setStep("complete");

      if (results.success > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${results.success} contacts.`,
        });
        onImportComplete();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
      setStep("mapping");
    }
  };

  const downloadTemplate = () => {
    const template = "Name,Email,Phone,Company,Position,Status,Priority,Notes\nJohn Doe,john@example.com,+44 1234 567890,Acme Corp,Sales Manager,active,high,Important client\nJane Smith,jane@example.com,+44 0987 654321,Tech Ltd,CEO,active,medium,";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-import-template.csv';
    a.click();
  };

  const resetImport = () => {
    setStep("upload");
    setParsedData(null);
    setColumnMapping({});
    setImportProgress(0);
    setImportResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Contacts</DialogTitle>
          <DialogDescription>
            Import multiple contacts from a CSV file
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Drop your CSV file here</h3>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                id="csv-upload"
              />
              <Button asChild>
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Select CSV File
                </label>
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                CSV file should include headers. Required field: Name. Optional: Email, Phone, Company, Position, Status, Priority, Notes.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "mapping" && parsedData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Map CSV Columns</h3>
                <p className="text-sm text-muted-foreground">
                  {parsedData.rows.length} rows detected
                </p>
              </div>
              <Badge variant="outline">{parsedData.headers.length} columns</Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CSV Column</TableHead>
                    <TableHead>Sample Data</TableHead>
                    <TableHead>Maps To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.headers.map((header, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {parsedData.rows[0]?.[index] || '-'}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={columnMapping[header]}
                          onValueChange={(value) =>
                            setColumnMapping({ ...columnMapping, [header]: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_MAPPINGS.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={() => setStep("preview")}>
                Preview Import
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && parsedData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Preview</h3>
              <p className="text-sm text-muted-foreground">
                Review the first 5 rows before importing
              </p>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.values(columnMapping)
                      .filter((v) => v !== 'skip')
                      .map((field, index) => (
                        <TableHead key={index}>
                          {FIELD_MAPPINGS.find((f) => f.value === field)?.label}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.rows.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {parsedData.headers.map((header, colIndex) => {
                        const mappedField = columnMapping[header];
                        if (mappedField === 'skip') return null;
                        return (
                          <TableCell key={colIndex}>
                            {row[colIndex] || '-'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Total rows to import: {parsedData.rows.length}
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Start Import
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Upload className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h3 className="font-medium mb-2">Importing Contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please wait while we process your data...
              </p>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">{importProgress}%</p>
            </div>
          </div>
        )}

        {step === "complete" && importResult && (
          <div className="space-y-4">
            <div className="text-center py-6">
              {importResult.success > 0 && (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
              )}
              {importResult.success === 0 && (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              )}
              <h3 className="font-medium mb-2">Import Complete</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">{importResult.success}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{importResult.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Errors:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div>• ... and {importResult.errors.length - 10} more errors</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
