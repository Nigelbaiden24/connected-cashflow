import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createWorker } from 'tesseract.js';

interface DocumentUploadProps {
  onTextExtracted: (text: string, type: 'ocr' | 'text') => void;
}

export const DocumentUpload = ({ onTextExtracted }: DocumentUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // Check if it's an image (for OCR) or text file
      if (file.type.startsWith('image/')) {
        await processImageWithOCR(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        await processTextFile(file);
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please upload an image (PNG, JPG) or text file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "Processing failed",
        description: "Could not process the file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  };

  const processImageWithOCR = async (file: File) => {
    toast({
      title: "Processing image",
      description: "Running OCR on your document...",
    });

    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    if (text.trim()) {
      onTextExtracted(text, 'ocr');
      toast({
        title: "OCR complete",
        description: "Text extracted from image successfully",
      });
    } else {
      toast({
        title: "No text found",
        description: "Could not extract text from the image",
        variant: "destructive",
      });
    }
  };

  const processTextFile = async (file: File) => {
    const text = await file.text();
    if (text.trim()) {
      onTextExtracted(text, 'text');
      toast({
        title: "File loaded",
        description: "Text file content extracted successfully",
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        id="document-upload"
        className="hidden"
        accept="image/*,.txt"
        onChange={handleFileUpload}
        disabled={isProcessing}
      />
      <label htmlFor="document-upload">
        <Button
          variant="outline"
          size="icon"
          disabled={isProcessing}
          asChild
        >
          <span className="cursor-pointer">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};
