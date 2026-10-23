
import { useState, useEffect } from "react";

export default function AudioButton({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speakWord() {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    // Stop any audio that is already playing.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Use an English voice.
    utterance.lang = "en-ZA";
    utterance.rate = 0.8;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  if (!isSupported) {
    return <p>Audio playback is not supported by this browser.</p>;
  }

  return (
    <button
      type="button"
      onClick={speakWord}
      disabled={isSpeaking}
      aria-label={`Listen to ${text}`}
    >
      {isSpeaking ? "Playing..." : "🔊 Hear the word"}
    </button>
  );
}
