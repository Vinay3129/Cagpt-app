import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronsLeft,
  Calculator,
  MoreHorizontal,
  Pencil,
  Share2,
  Archive,
  Settings
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

const Sidebar = ({
  isCollapsed,
  onToggle,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  selectedChatId,
  onSubjectFilter,
  selectedSubject,
  subjectList = [],
  chatHistory = [],
  onSettingsClick
}) => {
  const [menuConfig, setMenuConfig] = useState({ id: null, direction: 'up', position: { top: 0, left: 0 } });
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuConfig({ id: null, direction: 'up', position: { top: 0, left: 0 } });
      }
    };

    if (menuConfig.id) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuConfig.id]);

  const handleRename = (e, chatId) => {
    e.stopPropagation();
    setMenuConfig({ id: null, direction: 'up', position: { top: 0, left: 0 } });
    const newTitle = prompt("Enter new name for the chat:");
    if (newTitle && newTitle.trim() !== "") {
      onRenameChat(chatId, newTitle.trim());
    }
  };

  const handleDelete = (e, chatId) => {
    e.stopPropagation();
    setMenuConfig({ id: null, direction: 'up', position: { top: 0, left: 0 } });
    if (window.confirm("Are you sure you want to delete this chat?")) {
      onDeleteChat(chatId);
    }
  };

  const toggleMenu = (e, chatId) => {
    e.stopPropagation();

    if (menuConfig.id === chatId) {
      setMenuConfig({ id: null, direction: 'up', position: { top: 0, left: 0 } });
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const sidebarRect = sidebarRef.current?.getBoundingClientRect();
    
    if (!sidebarRect) return;

    // Calculate menu dimensions (approximate)
    const menuHeight = 160; // Height of 4 menu items
    const menuWidth = 160;

    // Calculate available space
    const spaceAbove = buttonRect.top - sidebarRect.top;
    const spaceBelow = sidebarRect.bottom - buttonRect.bottom;
    const spaceRight = window.innerWidth - buttonRect.right;

    // Determine direction
    let direction = 'up';
    let top = buttonRect.top - menuHeight - 8; // 8px margin
    
    if (spaceAbove < menuHeight && spaceBelow > menuHeight) {
      direction = 'down';
      top = buttonRect.bottom + 8;
    }

    // Ensure menu stays within viewport
    if (top < 8) top = 8;
    if (top + menuHeight > window.innerHeight - 8) {
      top = window.innerHeight - menuHeight - 8;
    }

    // Position horizontally - prefer left side of button
    let left = buttonRect.left - menuWidth - 8;
    
    // If not enough space on left, put on right
    if (left < 8) {
      left = buttonRect.right + 8;
    }

    // If still not enough space on right, center on button
    if (left + menuWidth > window.innerWidth - 8) {
      left = buttonRect.left - (menuWidth / 2) + (buttonRect.width / 2);
    }

    // Final bounds check
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    setMenuConfig({
      id: chatId,
      direction,
      position: { top, left }
    });
  };

  return (
    <div 
      ref={sidebarRef}
      className={`
        flex flex-col bg-primary border-r border-border
        h-full shrink-0
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-80'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-[65px]">
        <div className={`flex items-center space-x-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0' : 'w-full'}`}>
          <div onClick={onToggle} className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
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
        <button onClick={onNewChat} className="w-full flex items-center justify-center bg-accent hover:opacity-90 text-white rounded-lg h-10 font-semibold text-sm transition-opacity">
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="ml-2 whitespace-nowrap">New Chat</span>}
        </button>
      </div>

      {/* Subject Filter */}
      <div className={`px-4 pb-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <label className="text-xs font-medium text-text-secondary mb-2 block">Subject Filter</label>
        <Select value={selectedSubject} onValueChange={onSubjectFilter}>
          <SelectTrigger className="w-full bg-background border-border focus:ring-accent">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent className="bg-primary border-border text-text-primary">
            {subjectList.map((subject) => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
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
                className={`group relative p-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2 ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  selectedChatId === chat.id 
                    ? 'bg-background text-text-primary' 
                    : 'hover:bg-background/50 text-text-secondary'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!isCollapsed && <p className="text-sm font-medium truncate flex-1">{chat.title}</p>}
                
                {/* Three-dot menu button */}
                {!isCollapsed && (
                  <button 
                    onClick={(e) => toggleMenu(e, chat.id)} 
                    className="p-1 rounded-full hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <div className="p-4 border-t border-border">
        <button 
          onClick={onSettingsClick} 
          className={`w-full flex items-center p-2 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="ml-2 text-sm font-medium">Settings</span>}
        </button>
      </div>

      {/* Fixed positioned dropdown menu */}
      {menuConfig.id && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuConfig.position.top}px`,
            left: `${menuConfig.position.left}px`,
            zIndex: 9999
          }}
          className="w-40 bg-background border border-border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          <button 
            onClick={(e) => handleRename(e, menuConfig.id)} 
            className="w-full text-left flex items-center px-3 py-2 text-sm text-text-primary hover:bg-primary transition-colors rounded-t-lg"
          >
            <Pencil className="w-4 h-4 mr-2" /> Rename
          </button>
          <button 
            className="w-full text-left flex items-center px-3 py-2 text-sm text-text-secondary cursor-not-allowed opacity-50"
            disabled
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </button>
          <button 
            className="w-full text-left flex items-center px-3 py-2 text-sm text-text-secondary cursor-not-allowed opacity-50"
            disabled
          >
            <Archive className="w-4 h-4 mr-2" /> Archive
          </button>
          <button 
            onClick={(e) => handleDelete(e, menuConfig.id)} 
            className="w-full text-left flex items-center px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors rounded-b-lg"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;