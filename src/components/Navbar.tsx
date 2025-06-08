import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Users, Ticket, Package, UserCog, LogOut, LayoutDashboard, ChevronDown, MessageCircle, Settings } from 'lucide-react';
import { User } from '../types';
import ChatAI from './ChatAI';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import WhatsAppChat from './WhatsAppChat';

interface NavbarProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Navbar({ user, setUser }: NavbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showWhatsAppChat, setShowWhatsAppChat] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsLoading(false);
    }, 500);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-white shadow">
      {isLoading && <LoadingSpinner />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center flex-col justify-center">
              <div className="flex items-center">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">PhoneRepair CRM</span>
              </div>
              <div className="flex items-center mt-0.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold animate-fade-in">
                  Selamat datang,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-bold">
                    {user.name}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link
              to="/"
              onClick={() => handleNavigation('/')}
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            <Link
              to="/customers"
              onClick={() => handleNavigation('/customers')}
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <Users className="h-4 w-4 mr-1" />
              Customers
            </Link>
            <Link
              to="/tickets"
              onClick={() => handleNavigation('/tickets')}
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <Ticket className="h-4 w-4 mr-1" />
              Service Tickets
            </Link>
            <Link
              to="/inventory"
              onClick={() => handleNavigation('/inventory')}
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <Package className="h-4 w-4 mr-1" />
              Inventory
            </Link>
            <Link
              to="/technicians"
              onClick={() => handleNavigation('/technicians')}
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <UserCog className="h-4 w-4 mr-1" />
              Technicians
            </Link>
            <div className="flex items-center space-x-4">
              <ChatAI />
              
              {/* Dropdown Button */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  </svg>
                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <a
                        onClick={() => setShowWhatsAppChat(true)}
                        className="block px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Chat WA
                        </div>
                      </a>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out hover:scale-105"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
      {showWhatsAppChat && (
        <div className="fixed bottom-4 right-4 z-50 shadow-2xl">
          <WhatsAppChat />
          <button 
            onClick={() => setShowWhatsAppChat(false)}
            className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
    </nav>
  );
}
