import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EpubImporterProps {
  novelId: string;
  novelTitle: string;
  onImportComplete: () => void;
}

interface ImportResult {
  success: boolean;
  chaptersCount?: number;
  data?: {
    title: string;
    author: string;
    chapters: Array<{ number: number; title: string }>;
    coverUrl: string | null;
  };
  error?: string;
}

export function EpubImporter({ novelId, novelTitle, onImportComplete }: EpubImporterProps) {
  const [importing, setImporting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.epub')) {
      setResult({ success: false, error: 'Please select a valid EPUB file' });
      return;
    }

    setImporting(true);
    setResult(null);
    setProgress('Uploading EPUB file...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      setProgress('Parsing EPUB structure...');

      const formData = new FormData();
      formData.append('epub', file);
      formData.append('novelId', novelId);
      formData.append('language', language);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-epub`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse EPUB');
      }

      setProgress('');
      setResult({
        success: true,
        chaptersCount: data.chaptersCount,
        data: data.data,
      });

      // Notify parent to refresh
      onImportComplete();

    } catch (error) {
      console.error('EPUB import error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setImporting(false);
      setProgress('');
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Import EPUB</h3>
        <span className="text-xs text-muted-foreground">for {novelTitle}</span>
      </div>

      <div className="space-y-4">
        {/* Language Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Content Language</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('id')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === 'id'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              Indonesian
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <label className={`
          flex flex-col items-center justify-center w-full h-32 
          border-2 border-dashed rounded-xl cursor-pointer
          transition-colors
          ${importing 
            ? 'border-primary/50 bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }
        `}>
          {importing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">{progress || 'Processing...'}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload EPUB file
              </span>
              <span className="text-xs text-muted-foreground/70">
                Chapters, images & formatting will be extracted automatically
              </span>
            </div>
          )}
          <input
            type="file"
            accept=".epub"
            onChange={handleFileSelect}
            className="hidden"
            disabled={importing}
          />
        </label>

        {/* Result Display */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-primary/10 border border-primary/20' 
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">EPUB imported successfully!</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>{result.chaptersCount}</strong> chapters extracted</p>
                  {result.data?.coverUrl && (
                    <p>Cover image uploaded</p>
                  )}
                </div>
                {result.data?.chapters && result.data.chapters.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Extracted chapters:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.data.chapters.slice(0, 10).map((ch) => (
                        <div key={ch.number} className="text-xs text-foreground/80">
                          {ch.number}. {ch.title}
                        </div>
                      ))}
                      {result.data.chapters.length > 10 && (
                        <div className="text-xs text-muted-foreground">
                          ... and {result.data.chapters.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span>{result.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground/70 space-y-1">
          <p>• Upload a complete EPUB file to automatically extract all chapters</p>
          <p>• Images and formatting will be preserved</p>
          <p>• Existing chapters with the same number will be updated</p>
          <p>• You can import English and Indonesian versions separately</p>
        </div>
      </div>
    </div>
  );
}
