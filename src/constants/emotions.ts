export const EMOTIONS = {
  Joy:           { key: 'joy',           color: '#FFD700', label: 'Joy' },
  Sadness:       { key: 'sadness',       color: '#4169E1', label: 'Sadness' },
  Anger:         { key: 'anger',         color: '#FF4500', label: 'Anger' },
  Fear:          { key: 'fear',          color: '#9370DB', label: 'Fear' },
  Disgust:       { key: 'disgust',       color: '#50C878', label: 'Disgust' },
  Anxiety:       { key: 'anxiety',       color: '#FF8C00', label: 'Anxiety' },
  Envy:          { key: 'envy',          color: '#00CED1', label: 'Envy' },
  Embarrassment: { key: 'embarrassment', color: '#FF69B4', label: 'Embarrassment' },
  Ennui:         { key: 'ennui',         color: '#778899', label: 'Ennui' },
  Nostalgia:     { key: 'nostalgia',     color: '#DEB887', label: 'Nostalgia' },
} as const;

export type EmotionName = keyof typeof EMOTIONS;
export type Emotion = (typeof EMOTIONS)[EmotionName];

// Flat array for rendering lists
export const EMOTIONS_LIST = Object.values(EMOTIONS);
