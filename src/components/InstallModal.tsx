import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  QrCode,
  Share2,
  Download,
  Check,
  Copy,
  X,
  ExternalLink,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isMobile, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Determine current public URL
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('#')[0].split('?')[0]
      : 'https://ais-pre-wt5ujfl4eph4ocbkkkvtpl-122884453294.europe-west2.run.app';

  // QR Code URL using reliable free service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=ffffff&bgcolor=141824&data=${encodeURIComponent(appUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#0e111a] border border-[#262c3e] rounded-2xl p-6 shadow-2xl shadow-violet-950/40 text-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2538] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Installer sur votre Téléphone</h3>
              <p className="text-[11px] text-slate-400">Accédez à CineAI Studio comme une application native</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If user is already on mobile and Chrome/Android prompt is ready */}
        {isInstallable && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Installation 1-Clic Disponible !</span>
              </span>
              <button
                onClick={install}
                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer maintenant</span>
              </button>
            </div>
            <p className="text-[11px] text-violet-200">
              Votre navigateur prend en charge l'installation directe sur l'écran d'accueil sans passer par l'App Store ou Google Play.
            </p>
          </div>
        )}

        {/* Device selector tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141824] border border-[#202638]">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Android (Samsung, Xiaomi, Pixel...)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            iPhone & iPad (Apple Safari)
          </button>
        </div>

        {/* Instructions Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#121622] border border-[#1f2538] text-center space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Scannez avec votre appareil photo</span>
            </span>
            <div className="w-36 h-36 rounded-xl bg-[#141824] p-2 border border-violet-500/30 shadow-inner flex items-center justify-center overflow-hidden">
              <img
                src={qrCodeUrl}
                alt="Scanner pour installer CineAI"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Ouvre immédiatement CineAI Studio sur votre smartphone
            </p>
          </div>

          {/* Steps Column */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-slate-300">
              2. Ajoutez à l'écran d'accueil
            </span>

            {activeTab === 'android' ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#141824] border border-[#202638]">
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">1</span>
                  <span>Ouvrez le lien dans <strong>Google Chrome</strong> ou Samsung Internet.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#141824] border border-[#202638]">
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">2</span>
                  <span>Appuyez sur le menu <strong>(les 3 points ⋮)</strong> en haut à droite.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#141824] border border-[#202638]">
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">3</span>
                  <span>Appuyez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#141824] border border-[#202638]">
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">1</span>
                  <span>Ouvrez le lien dans <strong>Safari</strong> sur votre iPhone.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#141824] border border-[#202638]">
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">2</span>
                  <span>Appuyez sur le bouton <strong>Partager</strong> <Share2 className="w-3 h-3 inline text-cyan-400" /> en bas de l'écran.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-[#141824] border border-[#202638]">
                  <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">3</span>
                  <span>Faites défiler et choisissez <strong>« Sur l'écran d'accueil »</strong> puis <strong>Ajouter</strong>.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link Copy Box */}
        <div className="p-2.5 rounded-xl bg-[#121622] border border-[#1f2538] flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-mono truncate select-all">{appUrl}</span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium border border-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copier le lien</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>✓ Fonctionne hors-ligne • 0 Mo de stockage • Mises à jour instantanées</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
