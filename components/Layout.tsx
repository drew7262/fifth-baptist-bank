
import React from 'react';
import Header from './Header';
import GlobalBanner from './GlobalBanner';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white overflow-x-hidden">
      {/* Animated gradient background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-[spin_20s_linear_infinite]">
          <div className="absolute w-1/4 h-1/4 bg-gradient-to-br from-cyan-500/50 to-blue-600/20 rounded-full blur-3xl opacity-50 top-1/4 left-1/4"></div>
          <div className="absolute w-1/3 h-1/3 bg-gradient-to-tl from-purple-600/50 to-indigo-700/20 rounded-full blur-3xl opacity-40 bottom-1/4 right-1/4"></div>
           <div className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-sky-400/30 to-slate-800/10 rounded-full blur-3xl opacity-30 bottom-1/3 left-1/3"></div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <GlobalBanner />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;