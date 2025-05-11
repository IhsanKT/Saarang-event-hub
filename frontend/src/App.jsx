import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyRegistrations from './pages/MyRegistrations';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegistrators from './pages/AdminRegistrators';
import { useAuth } from './context/AuthContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  return (
    <nav className="sticky top-0 z-50 bg-white shadow flex items-center justify-between px-6 py-3 border-b">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-blue-700 font-bold text-xl tracking-tight">
          <span className="inline-block w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-lg">S</span>
          Saarang Event Hub
        </Link>
        <Link to="/" className="text-blue-700 hover:text-blue-900 font-medium transition">Events</Link>
        <Link to="/my-registrations" className="text-blue-700 hover:text-blue-900 font-medium transition">My Registrations</Link>
        {isAdmin && <Link to="/admin" className="text-blue-700 hover:text-blue-900 font-medium transition">Admin</Link>}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-blue-900 font-semibold mr-2">{user.name}</span>
            <button
              onClick={logout}
              className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition font-medium shadow-sm"
            >
              {isAdmin ? 'Logout as Admin' : 'Logout'}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition font-medium shadow-sm">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function MinimalNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow flex items-center justify-between px-6 py-3 border-b">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-blue-700 font-bold text-xl tracking-tight">
          <span className="inline-block w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-lg">S</span>
          Saarang Event Hub
        </Link>
        <Link to="/" className="text-blue-700 hover:text-blue-900 font-medium transition">Events</Link>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {isAuthPage ? <MinimalNavbar /> : <Navbar />}
      <main className="p-4 md:p-8 max-w-5xl mx-auto flex-1 w-full">
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/event/:id/registrators" element={<AdminRegistrators />} />
        </Routes>
      </main>
      <footer className="w-full text-center py-4 text-gray-500 text-sm bg-transparent">
        © Saarang IITM. All rights reserved.
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 