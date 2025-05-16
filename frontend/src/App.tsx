import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import ListTripPage from './pages/ListTripPage';
import Chat from './components/Chat';
import { mockUsers, mockMessages } from './data/mockData'; // Make sure these exist and are imported
import ChatList from './components/ChatList';
import { useState } from 'react';
import { Message } from './types';
import ProfilePage from './pages/ProfilePage';

// Placeholder imports for missing pages
const AboutPage = () => <div>About Us Page Coming Soon</div>;
const ContactPage = () => <div>Contact Page Coming Soon</div>;
const FAQPage = () => <div>FAQ Page Coming Soon</div>;
const PrivacyPolicyPage = () => <div>Privacy Policy Page Coming Soon</div>;
const TermsPage = () => <div>Terms of Service Page Coming Soon</div>;
const TrustSafetyPage = () => <div>Trust & Safety Page Coming Soon</div>;
const HelpCenterPage = () => <div>Help Center Page Coming Soon</div>;

// Add more placeholders as needed

function App() {
  useEffect(() => {
    // Set up page transitions or global animations here
    gsap.config({
      nullTargetWarn: false,
    });
  }, []);

  // Remove these lines:
  // const mockRecipientId = mockUsers[0]?.id || '';
  // const filteredMessages = mockMessages.filter(msg =>
  //   msg.senderId === mockRecipientId || msg.receiverId === mockRecipientId
  // );

  const handleSendMessage = (
    content: string,
    type: Message['type'],
    metadata?: Message['metadata']
  ) => {
    // Implement your message sending logic here
    // For demo, you can just log or update state
    console.log('Send message:', { content, type, metadata });
  };
  const handleTypingStart = () => {};
  const handleTypingEnd = () => {};

  const [selectedUserId, setSelectedUserId] = useState(mockUsers[0]?.id || '');

  const filteredMessages = mockMessages.filter(msg =>
    (msg.senderId === selectedUserId || msg.receiverId === selectedUserId)
  );

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/listings/create" element={<ListTripPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/trust-safety" element={<TrustSafetyPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/messages"
              element={
                <div className="flex h-[80vh]">
                  <ChatList onSelectChat={setSelectedUserId} selectedUserId={selectedUserId} />
                  <Chat
                    recipientId={selectedUserId}
                    messages={filteredMessages}
                    onSendMessage={handleSendMessage}
                    onTypingStart={handleTypingStart}
                    onTypingEnd={handleTypingEnd}
                  />
                </div>
              }
            />
           
            {/* Add more routes as needed */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;