import React from 'react';
import { Professional } from '../types';

interface ProfessionalCardProps {
  professional: Professional;
  onHireClick: (professional: Professional) => void;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onHireClick }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <img
        src={professional.avatar}
        alt={professional.name}
        className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-indigo-200"
      />
      <h3 className="text-xl font-semibold text-gray-900">{professional.name}</h3>
      <p className="text-indigo-600 mb-2">{professional.title}</p>
      <div className="flex items-center text-gray-500 text-sm mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{professional.location}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {professional.skills.map((skill, index) => (
          <span
            key={index}
            className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="mb-4">
        {renderStars(professional.rating)}
      </div>
      <button
        onClick={() => onHireClick(professional)}
        className="mt-auto px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out"
      >
        Hire
      </button>
    </div>
  );
};

export default ProfessionalCard;