import React, { useState, useEffect } from 'react';
import { ProjectState } from '../types/video';
import { exportVideo, ExportProgress } from '../engine/videoExporter';
import { Download, CheckCircle2, Film, Loader2, X, AlertTriangle } from 'lucide-react';

interface ExportModalProps {
  project: ProjectState;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    progress: 0,
    status: 'Prêt pour l\'exportation',
    currentSecond: 0,
    totalSeconds: 0,
  });
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setDownloadInfo(null);
      setProgress({
        progress: 0,
        status: 'Prêt pour l\'exportation',
        currentSecond: 0,
        totalSeconds: project.clips.reduce((acc, c) => acc + c.duration, 0),
      });
    }
  }, [isOpen, project.clips]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const result = await exportVideo(project, p => {
        setProgress(p);
      });
      setDownloadInfo({
        url: result.downloadUrl,
        filename: result.filename,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue lors de l\'exportation.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-[#10131d] border border-[#23293d] rounded-2xl p-6 shadow-2xl shadow-black/90 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1f2538] pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Exporter la Séquence Vidéo</h3>
          </div>
          {!isExporting && (
            <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Project Summary */}
        <div className="p-3 rounded-xl bg-[#090b11] border border-[#1b2030] text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Projet :</span>
            <span className="text-white font-medium truncate max-w-[200px]">{project.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Format de cadre :</span>
            <span className="text-cyan-400 font-mono">{project.aspectRatio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Nombre de plans :</span>
            <span className="text-slate-200">{project.clips.length} plans</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Durée totale :</span>
            <span className="text-violet-400 font-mono">
              {project.clips.reduce((acc, c) => acc + c.duration, 0).toFixed(1)} secondes
            </span>
          </div>
        </div>

        {/* Export Progress View */}
        {isExporting && (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>{progress.status}</span>
              </span>
              <span className="font-mono text-cyan-400 font-semibold">{progress.progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-[#1b2030] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 transition-all duration-150"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Rendu cinématographique 1080p et composition de la bande-son adaptative en direct.
            </p>
          </div>
        )}

        {/* Error View */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success View */}
        {downloadInfo && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Rendu Terminé avec Succès !</h4>
              <p className="text-xs text-slate-300 mt-1">
                Votre vidéo cinématographique est prête à être enregistrée sur votre appareil.
              </p>
            </div>
            <a
              href={downloadInfo.url}
              download={downloadInfo.filename}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier Vidéo ({downloadInfo.filename.slice(-8)})</span>
            </a>
          </div>
        )}

        {/* Footer Actions */}
        {!downloadInfo && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2538]">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg hover:bg-white/5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Démarrer le Rendu Vidéo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
