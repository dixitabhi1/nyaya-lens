import { FileUp, X } from "lucide-react";
import { useCallback, useState, DragEvent } from "react";

interface FileUploadProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
}

export function FileUpload({ onFile, accept, label = "Upload file" }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    onFile(f);
  }, [onFile]);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
      }`}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        if (accept) input.accept = accept;
        input.onchange = (e) => {
          const f = (e.target as HTMLInputElement).files?.[0];
          if (f) handleFile(f);
        };
        input.click();
      }}
    >
      {file ? (
        <div className="flex items-center justify-center gap-2">
          <FileUp className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">{file.name}</span>
          <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <FileUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Drag & drop or click to browse</p>
        </>
      )}
    </div>
  );
}
