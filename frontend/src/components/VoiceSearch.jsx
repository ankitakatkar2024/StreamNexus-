import { useState, useEffect } from "react";

const VoiceSearch = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setIsSupported(false);
    }
  }, []);

  const handleListen = () => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleListen}
      title="Voice Search"
      className={`p-3 rounded-full transition-all duration-300 ${
        isListening
          ? "bg-red-600 text-white animate-pulse shadow-lg scale-110"
          : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
      }`}
    >
      🎤
    </button>
  );
};

export default VoiceSearch;
