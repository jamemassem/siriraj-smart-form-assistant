
declare global {
  interface Window {
    SpeechRecognition: typeof webkitSpeechRecognition | undefined;
    webkitSpeechRecognition: any;
  }
  type SpeechRecognition = typeof webkitSpeechRecognition;
  type SpeechRecognitionEvent = any;
}

export {};
