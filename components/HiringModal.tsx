import React, { useState, useEffect, useRef } from 'react';
import { Professional } from '../types';

interface HiringModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
}

const HiringModal: React.FC<HiringModalProps> = ({ isOpen, onClose, professional }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectBrief, setProjectBrief] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form on close
      setClientName('');
      setClientEmail('');
      setProjectBrief('');
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!clientName || !clientEmail || !projectBrief) {
      alert('Please fill in all fields.');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    alert(`Hiring request submitted for ${professional?.name || 'a professional'} by ${clientName}! Project: "${projectBrief.substring(0, 50)}..."`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 sm:p-8 relative transform scale-95 md:scale-100 animate-scale-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hire {professional?.name}</h2>
        <p className="text-gray-600 mb-6">
          Fill out the form below to send a hiring request to {professional?.name} for your project.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700">Your Email</label>
            <input
              type="email"
              id="clientEmail"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="projectBrief" className="block text-sm font-medium text-gray-700">Project Brief</label>
            <textarea
              id="projectBrief"
              value={projectBrief}
              onChange={(e) => setProjectBrief(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
              required
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HiringModal;