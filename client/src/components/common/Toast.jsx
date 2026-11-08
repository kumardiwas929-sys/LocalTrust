import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { hideToast } from '../../redux/slices/notificationSlice.js';

const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.notifications.toast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgBorders = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-premium',
    error: 'bg-white border-rose-200 text-slate-800 shadow-premium',
    info: 'bg-white border-blue-200 text-slate-800 shadow-premium',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-in">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border ${
          bgBorders[toast.type] || bgBorders.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-sm font-medium">{toast.message}</div>
        <button
          onClick={() => dispatch(hideToast())}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
