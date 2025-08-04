import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Sun,
  Moon,
  ChevronsLeft,
  Calculator
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

const Switch = ({ checked, onCheckedChange }) => (
  <button
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? 'bg-accent' : 'bg-primary'
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
  isCollapsed,
  onToggle,
  onNewChat,
  onSelectChat,
  onDeleteChat, // Receive the delete function
  selectedChatId,
  isDarkMode,
  onThemeToggle,
  onSubjectFilter,
  selectedSubject,
  subjectList = [],
  chatHistory = []
}) => {
  const [hoveredChatId, setHoveredChatId] = useState(null);
  
  // This function now calls the prop from App.js
  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  return (
    <div className={`
      flex flex-col bg-primary border-r border-border
      h-full shrink-0
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-80'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-[65px]">
        <div className={`flex items-center space-x-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-full'}`}>
          <div
            onClick={onToggle}
            className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div className="whitespace-nowrap">
            <h1 className="text-lg font-semibold text-text-primary">CAgpt</h1>
          </div>
         </div>
        <button onClick={onToggle} className="p-1 text-text-secondary hover:text-text-primary">
          <ChevronsLeft className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center bg-accent hover:opacity-90 text-white rounded-lg h-10 font-semibold text-sm transition-opacity"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="ml-2 whitespace-nowrap">New Chat</span>}
        </button>
      </div>

      {/* Subject Filter */}
      <div className={`px-4 pb-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <label className="text-xs font-medium text-text-secondary mb-2 block">
          Subject Filter
        </label>
        <Select value={selectedSubject} onValueChange={onSubjectFilter}>
          <SelectTrigger className="w-full bg-background border-border focus:ring-accent">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent className="bg-primary border-border text-text-primary">
            {subjectList.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          <h3 className={`text-xs font-medium text-text-secondary mb-2 transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
             {isCollapsed ? '...' : 'Chat History'}
          </h3>
          <div className="space-y-1">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
                className={`
                  group relative p-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2
                  ${isCollapsed ? 'justify-center' : ''}
                  ${selectedChatId === chat.id
                    ? 'bg-background text-text-primary'
                    : 'hover:bg-background/50 text-text-secondary'
                  }
                `}
              >
                 <MessageSquare className="w-4 h-4 shrink-0" />
                {!isCollapsed && 
                  <p className="text-sm font-medium truncate flex-1">
                    {chat.title}
                  </p>
                }
                {hoveredChatId === chat.id && (
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="absolute top-2 right-2 text-text-secondary hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
         </div>
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <div className={`flex items-center space-x-2 text-text-secondary ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'hidden' : ''}`}>
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm">
              {isDarkMode ? 'Dark' : 'Light'} Mode
            </span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
        </div>
       </div>
    </div>
  );
};

export default Sidebar;