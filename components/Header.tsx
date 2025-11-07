import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <h1 className="text-3xl font-bold text-indigo-700 tracking-tight mb-2 md:mb-0">ProHire</h1>
        <nav className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out">
            Sign In
          </button>
          <button className="px-4 py-2 border border-indigo-500 text-indigo-700 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out">
            Post a Job
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;