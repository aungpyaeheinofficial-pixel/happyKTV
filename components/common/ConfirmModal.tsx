import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export const ConfirmModal: React.FC<Props> = ({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = "Confirm", cancelText = "Cancel", type = 'info' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-6">
        <div className="flex flex-col items-center text-center mb-6">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
              <AlertCircle size={24} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
           <p className="text-slate-400">{message}</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={onCancel}
             className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
           >
             {cancelText}
           </button>
           <button 
             onClick={onConfirm}
             className={`flex-1 py-2.5 rounded-xl text-white font-bold transition-colors ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
           >
             {confirmText}
           </button>
        </div>
      </div>
    </div>
  );
};
