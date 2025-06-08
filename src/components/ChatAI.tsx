import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

const ChatAI: React.FC = () => {
  return (
    <Link
      to="/chat"
      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
    >
      <Bot className="h-4 w-4 mr-1 text-blue-600" />
      ChatAI
    </Link>
  );
};

export default ChatAI;

