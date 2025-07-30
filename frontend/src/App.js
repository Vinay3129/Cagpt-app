import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import './App.css';

function CAgptApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setSelectedChatId(newChatId);
    setIsSidebarOpen(false); // Close sidebar on mobile after action
    
    console.log("New Chat Started");
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleThemeToggle = (checked) => {
    setIsDarkMode(checked);
  };

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
  };

  const handlePdfUpload = (file) => {
    // Mock PDF upload functionality
    console.log('Uploading PDF:', file.name);
  };

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        selectedChatId={selectedChatId}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        onSubjectFilter={handleSubjectFilter}
        selectedSubject={selectedSubject}
        onPdfUpload={handlePdfUpload}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        <ChatInterface
          onToggleSidebar={handleToggleSidebar}
          currentChatId={selectedChatId}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CAgptApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;