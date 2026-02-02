
import React, { useState } from 'react';
import { useBankData } from '../context/BankDataContext';
import { XIcon } from './icons';

const GlobalBanner: React.FC = () => {
  const { database } = useBankData();
  const { message, isVisible } = database.globalBanner;
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isVisible || isDismissed || !message) {
    return null;
  }

  return (
    <div className="bg-cyan-500/90 text-slate-900 text-sm font-semibold p-3 relative text-center z-50">
      <span>{message}</span>
      <button 
        onClick={() => setIsDismissed(true)} 
        className="absolute top-1/2 right-4 -translate-y-1/2 hover:bg-black/20 rounded-full p-1 transition-colors"
        aria-label="Dismiss banner"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default GlobalBanner;
