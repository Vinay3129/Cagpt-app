import React, { useState } from 'react';
import { mockChatHistory } from '../mock';
import {
  Plus,
  MessageSquare,
  Trash2,
  Sun,
  Moon,
  Menu,
  X,
  Calculator,
  ChevronDown
} from 'lucide-react';

const Button = ({ children, className = '', onClick, variant = 'default', size = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    icon: 'h-10 w-10'
  };
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Select = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // Added text-zinc-100 to make the selected value white
        className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span>{value}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 p-1 shadow-lg z-50">
          {children}
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ value, onSelect, children }) => (
  <button
    onClick={() => onSelect(value)}
    // Added text-zinc-100 to make the dropdown items white
    className="w-full rounded-sm px-2 py-1.5 text-sm text-left text-zinc-100 hover:bg-zinc-800"
  >
    {children}
  </button>
);

const Switch = ({ checked, onCheckedChange }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-primary' : 'bg-input'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);
const Sidebar = ({
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
  selectedChatId,
  isDarkMode,
  onThemeToggle,
  onSubjectFilter,
  selectedSubject,
  subjectList
}) => {
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    console.log('Deleting chat:', chatId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/50
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CAgpt</h1>
              <p className="text-xs text-zinc-400">CA Study Assistant</p>
            </div>
           </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-12 font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Subject Filter */}
        <div className="px-4 pb-4">
          <label className="text-sm font-medium text-zinc-300 mb-2 block">
            Subject Filter
          </label>
         <Select value={selectedSubject} onValueChange={onSubjectFilter}>
            {subjectList.map((subject) => (
              <SelectItem
                key={subject}
                value={subject}
                onSelect={onSubjectFilter}
              >
                 {subject}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 pb-2">
            <h3 className="text-sm font-medium text-zinc-300">Chat History</h3>
          </div>
           <div className="px-2 overflow-y-auto max-h-96 custom-scrollbar">
            {mockChatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
                className={`
                  group relative p-3 mx-2 mb-2 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedChatId === chat.id
                    ? 'bg-zinc-800/80 border border-zinc-700'
                    : 'hover:bg-zinc-900/50'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                   <MessageSquare className="w-4 h-4 text-zinc-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {chat.title}
                     </p>
                    <p className="text-xs text-zinc-400 truncate mt-1">
                      {chat.preview}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md">
                        {chat.subject}
                      </span>
                      <span className="text-xs text-zinc-500">
                         {new Date(chat.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {hoveredChatId === chat.id && (
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
           </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-zinc-400" />
              ) : (
                <Sun className="w-4 h-4 text-zinc-400" />
              )}
              <span className="text-sm text-zinc-300">
                {isDarkMode ? 'Dark' : 'Light'} Mode
              </span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={onThemeToggle}
            />
          </div>
         </div>
      </div>
    </>
  );
};

export default Sidebar;