import { useMemo, useCallback } from 'react';
import { generatePiiHighlightHtml } from '../utils/piiScrubber';
import { ShieldOff, Eye } from 'lucide-react';

interface PiiRedactorPreviewProps {
  originalText: string;
  redactedText: string;
  piiCount: number;
}

export default function PiiRedactorPreview({
  originalText,
  redactedText,
  piiCount,
}: PiiRedactorPreviewProps) {
  const highlightedHtml = useMemo(
    () => generatePiiHighlightHtml(originalText),
    [originalText]
  );

  const renderPreview = useCallback(() => {
    if (!originalText) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-surface-500">
          <Eye className="w-6 h-6 mb-2 opacity-50" />
          <p className="text-sm">PII redaction preview will appear here...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldOff className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-surface-300">PII Redaction Preview</span>
          </div>
          {piiCount > 0 ? (
            <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {piiCount} PII item{piiCount > 1 ? 's' : ''} detected & scrubbed
            </span>
          ) : (
            <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              No PII detected
            </span>
          )}
        </div>

        {/* Preview Panel */}
        <div className="bg-surface-900/50 rounded-xl p-4 border border-surface-700/50">
          <p className="text-xs text-surface-500 uppercase tracking-wider mb-2 font-semibold">
            What gets sent for analysis
          </p>
          <div
            className="text-sm text-surface-300 leading-relaxed font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>

        {piiCount > 0 && (
          <p className="text-xs text-surface-500 flex items-center gap-1.5">
            <ShieldOff className="w-3 h-3" />
            Highlighted items have been replaced with safe tokens before analysis.
          </p>
        )}
      </div>
    );
  }, [originalText, highlightedHtml, piiCount]);

  return <div className="w-full">{renderPreview()}</div>;
}
