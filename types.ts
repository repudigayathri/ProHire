import { FunctionCall } from "@google/genai";

export interface Professional {
  id: string;
  name: string;
  title: string;
  location: string;
  skills: string[];
  rating: number; // 1-5
  avatar: string; // URL to avatar image
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export enum GeminiChatMode {
  FlashChat = 'FlashChat',
  ProChat = 'ProChat',
  MapsSearch = 'MapsSearch',
  ThinkingMode = 'ThinkingMode',
}

export enum GeminiFeature {
  None = 'None',
  Chat = 'Chat',
  ImageGenerator = 'ImageGenerator',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title?: string;
  };
  maps?: {
    uri: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        text: string;
      }[];
    };
  };
}

export interface APIError extends Error {
  response?: {
    status: number;
    data: any;
  };
}

export interface ToolFunctionCall {
  name: string;
  args: Record<string, any>;
  id?: string;
}