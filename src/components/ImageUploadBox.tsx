import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadBoxProps {
  label: string;
  sublabel?: string;
  value: string; // Base64 data URL or empty
  onChange: (base64Url: string) => void;
  aspectRatio?: 'square' | 'circle';
  fallbackText?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  sublabel = 'ডিভাইস বা মেমরি থেকে ছবি সিলেক্ট করুন',
  value,
  onChange,
  aspectRatio = 'square',
  fallbackText = 'লোগো/ছবি'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compress image to manageable base64 data url using canvas
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 320; // 320px for high quality avatar/badge while preserving storage
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-300">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>ছবি মুছুন</span>
          </button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-2xl p-3 sm:p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : value
            ? 'border-emerald-500/40 bg-slate-950/80 hover:border-emerald-500'
            : 'border-slate-700 hover:border-slate-500 bg-slate-950/60 hover:bg-slate-950'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {value ? (
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-emerald-500/50 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center ${
                aspectRatio === 'circle' ? 'rounded-full' : 'rounded-2xl'
              }`}
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Camera className="w-3.5 h-3.5" />
                <span>ছবি সিলেক্ট করা হয়েছে</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                নতুন ছবি দিতে এখানে ক্লিক বা ড্রপ করুন
              </p>
              <span className="inline-block mt-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Change Photo
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all shadow-inner">
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                {isProcessing ? 'ছবি প্রসেস হচ্ছে...' : '📷 ছবি আপলোড করতে এখানে ক্লিক করুন'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {sublabel} (ড্র্যাগ ও ড্রপ সাপোর্টেড)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
