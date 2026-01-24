import { useState, useCallback } from 'react';
import { Upload, File, X, FileText, FileSpreadsheet, FileImage } from 'lucide-react';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  file?: File; // Store original File object for API uploads
}

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
}

const FileUpload = ({ 
  onFilesChange, 
  files, 
  accept = ".txt,.pdf,.doc,.docx,.md,.csv,.json",
  maxFiles = 5,
  maxSizeMB = 10
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    if (type.includes('spreadsheet') || type.includes('csv') || type.includes('excel')) {
      return FileSpreadsheet;
    }
    if (type.includes('image')) {
      return FileImage;
    }
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      // Read as text for text-based files
      if (file.type.includes('text') || 
          file.name.endsWith('.txt') || 
          file.name.endsWith('.md') || 
          file.name.endsWith('.csv') || 
          file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        // For other files, read as data URL (base64) but we'll just use the filename
        reader.readAsText(file);
      }
    });
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    setError(null);
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check max files
      if (files.length + newFiles.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        break;
      }
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      
      try {
        const content = await readFileContent(file);
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: content,
          file: file // Store original File object
        });
      } catch (err) {
        setError(`Failed to read "${file.name}"`);
      }
    }
    
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, maxFiles, maxSizeMB, onFilesChange]);

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
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    e.target.value = '';
  }, [processFiles]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-accent/50'
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
            ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
          `}>
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports TXT, MD, CSV, JSON, DOC, PDF (max {maxSizeMB}MB each, up to {maxFiles} files)
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <FileIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
