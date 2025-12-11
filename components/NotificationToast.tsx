import React, { useEffect, useState } from 'react';
import { IconBell, IconX } from './Icons';

interface NotificationToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ message, isVisible, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 8000); // 8 seconds auto-dismiss
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!isVisible && !show) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
    >
      <div className="bg-slate-900/95 border border-primary/50 text-white p-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-start gap-4 max-w-sm backdrop-blur-md">
        <div className="bg-primary/20 p-2 rounded-full text-primary shrink-0">
          <IconBell size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-primary mb-1 uppercase tracking-wide">Reminder</h4>
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
