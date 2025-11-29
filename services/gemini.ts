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

/**
 * Transcribes audio using gemini-2.5-flash
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert Blob to Base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove "data:audio/webm;base64," prefix if present
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert blob to base64 string"));
        }
      };
      reader.onerror = reject;
    });
    
    reader.readAsDataURL(audioBlob);
    const base64Audio = await base64Promise;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              // Gemini supports various mime types. If blob.type is empty or unsupported inline, 
              // it might need explicit setting. WebM/MP4 is common for MediaRecorder.
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio
            }
          },
          { text: "Generate a verbatim transcription of this audio." }
        ]
      }
    });

    return response.text || "Transcription failed or empty.";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};