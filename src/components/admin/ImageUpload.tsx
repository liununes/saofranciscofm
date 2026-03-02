import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/uploadImage';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

const ImageUpload = ({ value, onChange, folder = 'general', className = '' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, folder);
    if (url) onChange(url);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      {value ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-1"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Enviando...' : 'Upload'}
      </Button>
    </div>
  );
};

export default ImageUpload;
