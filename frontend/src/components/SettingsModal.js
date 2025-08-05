import React from 'react';
import { X, Palette, User, LogOut } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
  if (!isOpen) return null;

  const themes = [
    { name: 'dark', label: 'Modern Dark' },
    { name: 'light', label: 'Clean Light' },
    { name: 'space', label: 'Deep Space' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-primary border border-border rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-background">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Customization */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center">
              <Palette size={16} className="mr-2" /> Customize Theme
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {themes.map((theme) => (
                <button 
                  key={theme.name} 
                  onClick={() => onThemeChange(theme.name)}
                  className={`p-2 border-2 rounded-lg text-center ${currentTheme === theme.name ? 'border-accent' : 'border-border'}`}
                >
                  <div className={`w-full h-12 rounded-md mb-2 bg-${theme.name === 'dark' ? 'background' : theme.name === 'light' ? 'white' : 'accent'}`}>
                    {theme.name === 'space' && <img src="/space.jpg" alt="Space theme preview" className="w-full h-full object-cover rounded-md"/>}
                  </div>
                  <p className="text-xs font-medium text-text-primary">{theme.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Account Settings (Placeholder) */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center">
              <User size={16} className="mr-2" /> Account
            </h3>
            <button className="w-full text-left p-3 rounded-lg text-text-primary hover:bg-background transition-colors">
              Account Settings
            </button>
          </div>
          
          {/* Logout (Placeholder) */}
          <div>
             <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center">
              <LogOut size={16} className="mr-2" /> Session
            </h3>
            <button className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;