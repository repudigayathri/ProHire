import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, GenerateImagesResponse, Modality, Type } from "@google/genai";
import { GroundingChunk, LatLng, ToolFunctionCall } from '../types';

const getGenAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateTextContent(
  modelName: string,
  prompt: string,
  config: GenerateContentParameters['config'] = {},
  toolConfig?: GenerateContentParameters['toolConfig'],
  // Add tools as a top-level parameter to align with GenerateContentParameters type
  tools?: GenerateContentParameters['tools'],
): Promise<{ text: string; groundingUrls: GroundingChunk[] | undefined; functionCalls?: ToolFunctionCall[] }> {
  try {
    const ai = getGenAI();
    
    const requestConfig: GenerateContentParameters = {
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config,
      toolConfig,
      // Pass tools directly in the requestConfig
      tools,
    };

    const response: GenerateContentResponse = await ai.models.generateContent(requestConfig);

    const text = response.text || "No text response.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter(part => 'functionCall' in part)
      .map(part => part.functionCall as ToolFunctionCall);

    return { text, groundingUrls: groundingChunks, functionCalls };
  } catch (error) {
    console.error("Error calling Gemini API for text content:", error);
    throw error;
  }
}

export async function generateImage(prompt: string, aspectRatio: string): Promise<string[]> {
  try {
    const ai = getGenAI();
    const response: GenerateImagesResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1, // Only generate one image for simplicity
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      return [imageUrl];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error calling Gemini API for image generation:", error);
    throw error;
  }
}

export async function getGeolocation(): Promise<LatLng | null> {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      resolve(null);
    }
  });
}

// Minimal example of a tool function, for demonstration purposes.
// In a real app, this would interact with an external service.
export interface LightControlArgs {
  brightness: number;
  colorTemperature: string; // e.g., 'daylight', 'cool', 'warm'
}

export async function controlLight(args: LightControlArgs): Promise<string> {
  console.log('Simulating light control with:', args);
  // Simulate an API call
  return new Promise(resolve => setTimeout(() => {
    console.log(`Light set to brightness ${args.brightness} and color temperature ${args.colorTemperature}`);
    resolve(`Light control successful: Brightness ${args.brightness}, Color: ${args.colorTemperature}`);
  }, 1000));
}

// Function declaration for the controlLight tool
export const controlLightFunctionDeclaration = {
  name: 'controlLight',
  parameters: {
    type: Type.OBJECT,
    description: 'Set the brightness and color temperature of a room light.',
    properties: {
      brightness: {
        type: Type.NUMBER,
        description:
          'Light level from 0 to 100. Zero is off and 100 is full brightness.',
      },
      colorTemperature: {
        type: Type.STRING,
        description:
          'Color temperature of the light fixture such as `daylight`, `cool` or `warm`.',
      },
    },
    required: ['brightness', 'colorTemperature'],
  },
};