import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileChange: (file: File | null) => void;
  uploadedFile: File | null;
  accept?: string;
}

const FileUploadZone = ({ onFileChange, uploadedFile, accept = ".pdf" }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the container entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (acceptedTypes.includes(fileExtension) || acceptedTypes.includes('*')) {
        onFileChange(file);
      }
    }
  }, [accept, onFileChange]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
        "flex flex-col items-center justify-center gap-4",
        isDragging
          ? "border-[#0066FF] bg-[#0066FF]/10 shadow-[0_0_20px_rgba(0,102,255,0.3)]"
          : "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Icon */}
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
        isDragging
          ? "bg-[#0066FF]/30 scale-110"
          : "bg-primary/20"
      )}>
        <Upload className={cn(
          "w-8 h-8 transition-colors duration-300",
          isDragging ? "text-[#0066FF]" : "text-primary"
        )} />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className={cn(
          "font-medium transition-colors duration-300",
          isDragging ? "text-[#0066FF]" : "text-foreground"
        )}>
          {isDragging ? "¡Suelta el archivo aquí!" : "Arrastra tu archivo PDF aquí"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          o haz clic para seleccionar
        </p>
      </div>

      {/* Uploaded File Display */}
      {uploadedFile && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 mt-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">{uploadedFile.name}</span>
          <button 
            onClick={handleRemoveFile}
            className="ml-2 p-1 rounded-full hover:bg-green-500/30 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Drag overlay glow effect */}
      {isDragging && (
        <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-[#0066FF] animate-pulse" />
      )}
    </div>
  );
};

export default FileUploadZone;
