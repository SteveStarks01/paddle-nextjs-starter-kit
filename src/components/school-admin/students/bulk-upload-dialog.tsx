'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { registerStudentsBulk, parseCSVData, BulkRegistrationResult } from '@/utils/school-fee/student-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadDialog({ isOpen, onClose, onSuccess }: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkRegistrationResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'firstName,lastName,email,studentId,departmentId,specialtyId,academicYear\n' +
                      'John,Doe,john.doe@example.com,STU001,dept-id-1,specialty-id-1,2024-2025\n' +
                      'Jane,Smith,jane.smith@example.com,STU002,dept-id-2,specialty-id-2,2024-2025';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Parse CSV data
      const { data: studentsData, errors: parseErrors } = parseCSVData(fileContent);
      
      if (parseErrors.length > 0) {
        toast({
          title: 'CSV parsing failed',
          description: parseErrors.join(', '),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (studentsData.length === 0) {
        toast({
          title: 'No valid data found',
          description: 'The CSV file contains no valid student records.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Register students
      const result = await registerStudentsBulk(studentsData);
      
      clearInterval(progressInterval);
      setProgress(100);
      setUploadResult(result);

      if (result.success.length > 0) {
        toast({
          title: 'Bulk upload completed',
          description: `Successfully registered ${result.success.length} students. ${result.errors.length} errors occurred.`,
        });
        onSuccess();
      } else {
        toast({
          title: 'Upload failed',
          description: 'No students were successfully registered.',
          variant: 'destructive',
        });
      }

    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFile(null);
      setUploadResult(null);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Student Upload</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Step 1: Download Template</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download the CSV template with the required columns and format.
            </p>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Step 2: Upload CSV File</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Select your completed CSV file with student data.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="csvFile">CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                  ref={fileInputRef}
                />
              </div>
              {file && (
                <div className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing students...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Results */}
          {uploadResult && (
            <div className="space-y-4">
              <h3 className="font-semibold">Upload Results</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{uploadResult.success.length}</strong> students registered successfully
                  </AlertDescription>
                </Alert>
                
                {uploadResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{uploadResult.errors.length}</strong> errors occurred
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <div className="space-y-1 text-sm">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-red-600">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              {uploadResult ? 'Close' : 'Cancel'}
            </Button>
            {!uploadResult && (
              <Button onClick={handleUpload} disabled={loading || !file} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Upload Students
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}