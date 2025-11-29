import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
// Note: process.env.API_KEY is assumed to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to the Gemini Chatbot (gemini-3-pro-preview)
 * Returns a stream of text chunks.
 */
export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are a helpful audio engineer assistant named Sonic. You help users with audio mixing, equalization advice, and general questions.",
      }
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    return result;
  } catch (error) {
    console.error("Error in chat stream:", error);
    throw error;
  }
};

/**
 * Generates Speech from text using gemini-2.5-flash-preview-tts
 * Returns an AudioBuffer.
 */
export const generateSpeech = async (
  text: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    // Decode Base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode Audio Data
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    return audioBuffer;

  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};
