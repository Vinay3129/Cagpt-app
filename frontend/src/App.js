import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import './App.css';
import axios from 'axios';
import { Link, X } from 'lucide-react';

const LinkBubble = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="bg-primary p-4 rounded-lg shadow-lg border border-border w-64 mb-2">
          <h3 className="font-semibold text-text-primary mb-2">Helpful Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="text-accent hover:underline">Placeholder Link 1</a></li>
            <li><a href="#" className="text-accent hover:underline">Placeholder Link 2</a></li>
            <li><a href="#" className="text-accent hover:underline">Placeholder Link 3</a></li>
          </ul>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Toggle helpful links"
      >
        {isOpen ? <X size={20} /> : <Link size={20} />}
      </button>
    </div>
  );
};

function CAgptApp() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [subjectList, setSubjectList] = useState(['All Subjects']);
  const [chatHistory, setChatHistory] = useState([]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/chats');
      setChatHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const subjectsRes = await axios.get('http://127.0.0.1:8000/subjects');
        if (subjectsRes.data.subjects) {
          setSubjectList(subjectsRes.data.subjects);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
      await fetchChatHistory();
    };
    fetchInitialData();
  }, []);

  const handleToggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleNewChat = () => {
    setSelectedChatId(null);
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  // --- NEW FUNCTION TO HANDLE DELETING A CHAT ---
  const handleDeleteChat = async (chatIdToDelete) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/chats/${chatIdToDelete}`);
      // Refresh the chat history list after deletion
      await fetchChatHistory();
      // If the deleted chat was the one currently selected, clear the view
      if (selectedChatId === chatIdToDelete) {
        setSelectedChatId(null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const handleThemeToggle = (checked) => setIsDarkMode(checked);
  const handleSubjectFilter = (subject) => setSelectedSubject(subject);

  const onNewChatCreated = async (newChatId) => {
    await fetchChatHistory();
    setSelectedChatId(newChatId);
  };

  return (
    <div className={`h-screen flex overflow-hidden bg-background text-text-primary`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat} // Pass the delete function
        selectedChatId={selectedChatId}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        onSubjectFilter={handleSubjectFilter}
        selectedSubject={selectedSubject}
        subjectList={subjectList}
        chatHistory={chatHistory}
      />
      <div className="flex-1 flex flex-col">
        <ChatInterface
          currentChatId={selectedChatId}
          setCurrentChatId={setSelectedChatId}
          selectedSubject={selectedSubject}
          onNewChatCreated={onNewChatCreated}
        />
      </div>
      <LinkBubble />
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