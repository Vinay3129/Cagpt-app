import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import './App.css';
import axios from 'axios';

function CAgptApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [subjectList, setSubjectList] = useState(['All Subjects']);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/subjects');
        if (response.data.subjects) {
          setSubjectList(response.data.subjects);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjectList(['All Subjects']);
      }
    };
    fetchSubjects();
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setSelectedChatId(newChatId);
    setIsSidebarOpen(false);
    console.log("New Chat Started");
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    setIsSidebarOpen(false);
  };

  const handleThemeToggle = (checked) => {
    setIsDarkMode(checked);
  };

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
  };

  return (
    <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
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
        subjectList={subjectList}
      />

      <div className="flex-1 flex flex-col lg:ml-0">
        <ChatInterface
          onToggleSidebar={handleToggleSidebar}
          currentChatId={selectedChatId}
          selectedSubject={selectedSubject} // <-- This line is added
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