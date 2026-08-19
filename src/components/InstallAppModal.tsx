import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Check, 
  Copy, 
  Share2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'ANDROID' | 'IOS'>('ANDROID');

  const appUrl = window.location.href;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white font-display">মোবাইলে অ্যাপ ইনস্টল করুন</h3>
          <p className="text-xs text-slate-400 mt-1">
            কোনো আলাদা ভারী APK ছাড়াই সরাসরি ফোনে অ্যাপ হিসেবে চলবে
          </p>
        </div>

        {/* 1-Click Native Install Button (if browser supports prompt) */}
        {deferredPrompt && (
          <div className="mb-5">
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>১ ক্লিকে ইনস্টল করুন (Install Now)</span>
            </button>
          </div>
        )}

        {/* Device Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveDeviceTab('ANDROID')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeDeviceTab === 'ANDROID'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🤖 Android (Chrome)
          </button>
          <button
            onClick={() => setActiveDeviceTab('IOS')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeDeviceTab === 'IOS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🍎 iPhone (Safari)
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        {activeDeviceTab === 'ANDROID' ? (
          <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-[11px]">
                ১
              </span>
              <p className="text-slate-300">
                মোবাইলের <strong className="text-white">Google Chrome</strong> ব্রাউজারে অ্যাপটির লিংক খুলুন।
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-[11px]">
                ২
              </span>
              <p className="text-slate-300">
                উপরে ডানদিকের <strong className="text-white">থ্রি-ডট (⋮) মেনু</strong>-তে ক্লিক করুন।
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-[11px]">
                ৩
              </span>
              <p className="text-slate-300">
                তালিকা থেকে <strong className="text-emerald-400">"Install app"</strong> অথবা <strong className="text-emerald-400">"Add to Home screen"</strong> চাপুন।
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-[11px]">
                ১
              </span>
              <p className="text-slate-300">
                আইফোনে <strong className="text-white">Safari</strong> ব্রাউজারে লিংকটি ওপেন করুন।
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-[11px]">
                ২
              </span>
              <p className="text-slate-300">
                নিচের মাঝখানে থাকা <strong className="text-white">Share (শেয়ার ⎙)</strong> আইকনে চাপ দিন।
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center flex-shrink-0 text-[11px]">
                ৩
              </span>
              <p className="text-slate-300">
                স্ক্রল করে <strong className="text-emerald-400">"Add to Home Screen"</strong> চাপুন।
              </p>
            </div>
          </div>
        )}

        {/* Copy App Link */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold mb-2">অ্যাপ লিংক কপি করুন:</div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono select-all truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
