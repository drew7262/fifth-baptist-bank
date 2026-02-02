
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, MenuIcon, XIcon, LogOutIcon } from './icons';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };
  
  const handleLoginRedirect = () => {
    navigate('/login');
    setIsMenuOpen(false);
  }

  const renderAuthLinks = () => {
    if (user) {
      return (
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-sm text-gray-300">Welcome, {user.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm bg-red-600/80 hover:bg-red-500/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={handleLoginRedirect}
          className="text-sm bg-cyan-500/80 hover:bg-cyan-400/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Sign In
        </button>
      </div>
    );
  };

  const renderMobileMenu = () => (
    <div className="md:hidden absolute top-full right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-lg rounded-lg shadow-xl p-4 z-50">
      {!user ? (
        <>
        <Link to="/" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Home</Link>
        <button
          onClick={handleLoginRedirect}
          className="w-full text-left mt-2 bg-cyan-500/80 hover:bg-cyan-400/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Sign In
        </button>
        </>
      ) : (
         <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-left text-sm bg-red-600/80 hover:bg-red-500/80 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <LogOutIcon className="w-4 h-4" />
            Logout
          </button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 bg-slate-900/50 backdrop-blur-lg z-40">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <LogoIcon className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold tracking-tight">Fifth Baptist Bank</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-300">
            <Link to="/" className="hover:text-white transition-colors">Personal</Link>
            <Link to="/business" className="hover:text-white transition-colors">Business</Link>
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>

          {renderAuthLinks()}

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
            {isMenuOpen && renderMobileMenu()}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
