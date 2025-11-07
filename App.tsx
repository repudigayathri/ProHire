import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchInput from './components/SearchInput';
import ProfessionalCard from './components/ProfessionalCard';
import HiringModal from './components/HiringModal';
import GeminiChat from './components/GeminiChat';
import ImageGenerator from './components/ImageGenerator';
import { PROFESSIONALS } from './constants';
import { Professional, GeminiFeature } from './types';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>(PROFESSIONALS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [activeGeminiFeature, setActiveGeminiFeature] = useState<GeminiFeature>(GeminiFeature.None);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = PROFESSIONALS.filter(professional =>
      professional.name.toLowerCase().includes(lowercasedSearchTerm) ||
      professional.title.toLowerCase().includes(lowercasedSearchTerm) ||
      professional.location.toLowerCase().includes(lowercasedSearchTerm) ||
      professional.skills.some(skill => skill.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredProfessionals(filtered);
  }, [searchTerm]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleHireClick = useCallback((professional: Professional) => {
    setSelectedProfessional(professional);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProfessional(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Find & Hire the Right Professional
        </h2>

        <SearchInput searchTerm={searchTerm} onSearchChange={handleSearchChange} />

        <section className="mb-12">
          {filteredProfessionals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProfessionals.map(professional => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onHireClick={handleHireClick}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">No professionals found matching your search.</p>
          )}
        </section>

        <section className="mt-12 p-6 bg-indigo-50 rounded-lg shadow-inner">
          <h2 className="text-3xl font-bold text-indigo-800 text-center mb-6">
            Explore Gemini AI Capabilities
          </h2>
          <p className="text-center text-indigo-700 mb-8 max-w-2xl mx-auto">
            Leverage advanced AI for content analysis, image generation, and more to enhance your hiring and project management experience.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveGeminiFeature(GeminiFeature.Chat)}
              className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ease-in-out
                ${activeGeminiFeature === GeminiFeature.Chat ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'}`}
            >
              AI Chat & Grounding
            </button>
            <button
              onClick={() => setActiveGeminiFeature(GeminiFeature.ImageGenerator)}
              className={`px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ease-in-out
                ${activeGeminiFeature === GeminiFeature.ImageGenerator ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'}`}
            >
              AI Image Generator
            </button>
          </div>

          <div>
            {activeGeminiFeature === GeminiFeature.Chat && <GeminiChat />}
            {activeGeminiFeature === GeminiFeature.ImageGenerator && <ImageGenerator />}
            {activeGeminiFeature === GeminiFeature.None && (
              <div className="p-8 text-center text-gray-600 bg-white rounded-lg shadow-sm">
                <p className="text-lg">Select an AI feature above to get started.</p>
              </div>
            )}
          </div>
        </section>

      </main>

      <HiringModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        professional={selectedProfessional}
      />
    </div>
  );
};

export default App;