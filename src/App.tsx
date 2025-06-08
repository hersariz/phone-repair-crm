import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import ServiceTicketList from './components/ServiceTicketList';
import InventoryManagement from './components/InventoryManagement';
import TechnicianManagement from './components/TechnicianManagement';
import Login from './components/Login';
import Register from './components/Register';
import ChatPage from './components/ChatPage';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} setUser={setUser} />}
        <main className={user ? "pt-16" : ""}>
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <ServiceTicketList />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            } />
            <Route path="/technicians" element={
              <ProtectedRoute>
                <TechnicianManagement />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
