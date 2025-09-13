import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Import components
import Navigation from './components/Navigation/Navigation';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SearchResultsPage from './pages/SearchResultsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  console.log('🚀 Full Voya Travel Platform App Loading!');

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/property/:id" element={<PropertyDetailPage />} />
                <Route path="/booking/:id" element={<BookingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
