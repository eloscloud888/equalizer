export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
}

export type ViewState = 'equalizer' | 'chat' | 'tts' | 'transcription';

export enum AudioStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
}