import React, { useState, useEffect, useCallback } from 'react';
// Import GenerateContentParameters from @google/genai
import { GenerateContentParameters } from '@google/genai';
// Import LightControlArgs from services/geminiService
import { generateTextContent, getGeolocation, controlLight, controlLightFunctionDeclaration, LightControlArgs } from '../services/geminiService';
import { GeminiChatMode, GroundingChunk, LatLng, ToolFunctionCall } from '../types';
import { MAPS_BILLING_DOCS_URL } from '../constants';

const GeminiChat: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [groundingUrls, setGroundingUrls] = useState<GroundingChunk[] | undefined>(undefined);
  const [currentChatMode, setCurrentChatMode] = useState<GeminiChatMode>(GeminiChatMode.FlashChat);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const fetchGeolocation = useCallback(async () => {
    if (currentChatMode === GeminiChatMode.MapsSearch && !userLocation) {
      setError('Fetching geolocation...');
      const location = await getGeolocation();
      if (location) {
        setUserLocation(location);
        setError(null);
      } else {
        setError('Failed to get geolocation. Maps search may not work. Please ensure location services are enabled.');
      }
    }
  }, [currentChatMode, userLocation]);

  useEffect(() => {
    fetchGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatMode]); // Only re-run when currentChatMode changes

  const handleSendMessage = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setLoading(true);
    setResponse('');
    setError(null);
    setGroundingUrls(undefined);

    try {
      let modelName: string;
      let config: GenerateContentParameters['config'] = {};
      let toolConfig: GenerateContentParameters['toolConfig'] = undefined;
      // Initialize tools as undefined; it will be assigned based on chat mode
      let tools: GenerateContentParameters['tools'] = undefined; 

      switch (currentChatMode) {
        case GeminiChatMode.FlashChat:
          modelName = 'gemini-2.5-flash';
          // Add generic tool for demonstration when not in MapsSearch mode
          tools = [{functionDeclarations: [controlLightFunctionDeclaration]}];
          break;
        case GeminiChatMode.ProChat:
          modelName = 'gemini-2.5-pro';
          config = { thinkingConfig: { thinkingBudget: 32768 } };
          // Add generic tool for demonstration when not in MapsSearch mode
          tools = [{functionDeclarations: [controlLightFunctionDeclaration]}];
          break;
        case GeminiChatMode.MapsSearch:
          modelName = 'gemini-2.5-flash';
          if (!userLocation) {
            setError('Geolocation is required for Maps Search. Please wait for location or manually input.');
            setLoading(false);
            return;
          }
          // For MapsSearch, only googleMaps tool is permitted
          tools = [{ googleMaps: {} }];
          toolConfig = {
            retrievalConfig: {
              latLng: userLocation,
            },
          };
          // Cannot set responseMimeType or responseSchema with googleMaps tool, so ensure config is clean
          config = {};
          break;
        case GeminiChatMode.ThinkingMode:
          modelName = 'gemini-2.5-pro';
          config = { thinkingConfig: { thinkingBudget: 32768 } };
          // Add generic tool for demonstration when not in MapsSearch mode
          tools = [{functionDeclarations: [controlLightFunctionDeclaration]}];
          break;
        default:
          modelName = 'gemini-2.5-flash';
          // Add generic tool for demonstration when not in MapsSearch mode
          tools = [{functionDeclarations: [controlLightFunctionDeclaration]}];
          break;
      }
      
      const { text, groundingUrls: fetchedGroundingUrls, functionCalls } = await generateTextContent(
        modelName,
        prompt,
        config, // Pass config directly
        toolConfig,
        tools,  // Pass tools directly as a top-level parameter
      );

      setResponse(text);
      if (fetchedGroundingUrls) {
        setGroundingUrls(fetchedGroundingUrls);
      }
      
      if (functionCalls && functionCalls.length > 0) {
        // Handle function calls
        for (const fc of functionCalls) {
          if (fc.name === 'controlLight') {
            const args = fc.args as LightControlArgs; // LightControlArgs is now imported
            const toolResult = await controlLight(args);
            setResponse(prev => `${prev}\n\nTool Call: ${fc.name} with args ${JSON.stringify(args)}\nTool Result: ${toolResult}`);
            // In a real application, you would send the tool response back to the model
            // to update the context, but for a simple chat, we just display it.
          } else {
            setResponse(prev => `${prev}\n\nUnknown tool call: ${fc.name}`);
          }
        }
      }

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API key not valid")) {
        setError("Invalid API Key. Please check your environment configuration.");
      } else if (err.message && err.message.includes("Requested entity was not found.")) {
        setError(`API Error: The requested resource was not found. This might indicate an issue with the model or a temporary service problem. For Maps Grounding, please ensure billing is enabled for the Maps API. See billing documentation: ${MAPS_BILLING_DOCS_URL}`);
      } else {
        setError(`Failed to get response from Gemini API: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [prompt, currentChatMode, userLocation]);

  const handleModeChange = useCallback((mode: GeminiChatMode) => {
    setCurrentChatMode(mode);
    setResponse('');
    setError(null);
    setGroundingUrls(undefined);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Gemini AI Assistant</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleModeChange(GeminiChatMode.FlashChat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${currentChatMode === GeminiChatMode.FlashChat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          General Chat (Flash)
        </button>
        <button
          onClick={() => handleModeChange(GeminiChatMode.ProChat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${currentChatMode === GeminiChatMode.ProChat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Complex Chat (Pro)
        </button>
        <button
          onClick={() => handleModeChange(GeminiChatMode.MapsSearch)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${currentChatMode === GeminiChatMode.MapsSearch ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Maps Search (Grounding)
        </button>
        <button
          onClick={() => handleModeChange(GeminiChatMode.ThinkingMode)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${currentChatMode === GeminiChatMode.ThinkingMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Complex Query (Thinking Mode)
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="gemini-prompt" className="block text-sm font-medium text-gray-700 mb-2">
          {currentChatMode === GeminiChatMode.MapsSearch ?
            `Ask about places (e.g., "Good Italian restaurants nearby?"):` :
            `Your prompt (${currentChatMode}):`
          }
        </label>
        <textarea
          id="gemini-prompt"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            currentChatMode === GeminiChatMode.FlashChat ? 'Ask a quick question...' :
            currentChatMode === GeminiChatMode.ProChat ? 'Ask a complex question or request code...' :
            currentChatMode === GeminiChatMode.MapsSearch ? 'What are some good cafes in New York? (Requires geolocation)' :
            'Explain quantum physics in simple terms. (Thinking Mode)'
          }
          disabled={loading}
        ></textarea>
      </div>

      <button
        onClick={handleSendMessage}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Response...
          </span>
        ) : 'Send to Gemini'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Gemini's Response:</h3>
          {response}
        </div>
      )}

      {groundingUrls && groundingUrls.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Grounding Information:</h3>
          <ul className="list-disc pl-5">
            {groundingUrls.map((chunk, index) => (
              <li key={index} className="mb-1 text-blue-700">
                {chunk.web && (
                  <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {chunk.web.title || chunk.web.uri} (Web)
                  </a>
                )}
                {chunk.maps && (
                  <>
                    <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {chunk.maps.title || chunk.maps.uri} (Maps)
                    </a>
                    {chunk.maps.placeAnswerSources?.reviewSnippets && chunk.maps.placeAnswerSources.reviewSnippets.length > 0 && (
                      <ul className="list-circle pl-5 mt-1 text-sm text-blue-600">
                        {chunk.maps.placeAnswerSources.reviewSnippets.map((snippet, sIndex) => (
                          <li key={sIndex}>Review: "{snippet.text}"</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GeminiChat;