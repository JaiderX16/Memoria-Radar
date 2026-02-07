import React from 'react';
import { Check, Activity } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, theme }) => (
    <div className={`absolute top-14 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-none border-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${theme.bg} ${theme.border}`}>
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {type === 'success' ? <Check size={14} strokeWidth={3} /> : <Activity size={14} />}
        </div>
        <span className={`text-xs font-bold ${theme.text}`}>{message}</span>
    </div>
);

export default Toast;
