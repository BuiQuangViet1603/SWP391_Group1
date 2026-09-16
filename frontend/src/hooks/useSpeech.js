import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ============================================================================
 * Custom Hook: useSpeech
 * ============================================================================
 * A comprehensive, robust React hook encapsulating both the Web Speech API's
 * SpeechSynthesis (Text-to-Speech / TTS) and SpeechRecognition (Speech-to-Text / STT).
 *
 * Capabilities:
 * - Text-to-Speech (TTS): Reads text aloud, supports accent selection, pitch,
 *   rate, and word-boundary callbacks (for karaoke-style highlighting).
 * - Speech-to-Text (STT): Listens to user voice via microphone, provides both
 *   interim (live streaming) and final transcripts, and handles errors.
 * - Browser Support Detection: Gracefully indicates whether TTS and STT are available.
 */
export const useSpeech = () => {
  // --------------------------------------------------------------------------
  // State: Browser Compatibility
  // --------------------------------------------------------------------------
  const isTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const SpeechRecognitionClass =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSttSupported = Boolean(SpeechRecognitionClass);

  // --------------------------------------------------------------------------
  // State: TTS (Text-to-Speech)
  // --------------------------------------------------------------------------
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const activeUtteranceRef = useRef(null);

  // --------------------------------------------------------------------------
  // State: STT (Speech-to-Text)
  // --------------------------------------------------------------------------
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  /**
   * Initialize and fetch available voices for TTS.
   * Browsers load voices asynchronously, so we listen to `onvoiceschanged`.
   */
  useEffect(() => {
    if (!isTtsSupported) return;

    const populateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter primarily English voices (en-US, en-GB, en-AU, etc.) and fallback to all
      const englishVoices = allVoices.filter((v) => v.lang.startsWith('en'));
      setVoices(englishVoices.length > 0 ? englishVoices : allVoices);
    };

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }, [isTtsSupported]);

  // Clean up any ongoing speech or microphone on unmount
  useEffect(() => {
    return () => {
      if (isTtsSupported) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isTtsSupported]);

  // ==========================================================================
  // TEXT-TO-SPEECH (TTS) METHODS
  // ==========================================================================

  /**
   * Speak the given text with configurable speech settings.
   *
   * @param {string} text - The text to be read aloud.
   * @param {Object} options - Configuration options.
   * @param {SpeechSynthesisVoice} [options.voice] - The desired voice object.
   * @param {number} [options.rate=1.0] - Speed of speech (0.5 to 2.0).
   * @param {number} [options.pitch=1.0] - Pitch of speech (0.5 to 1.5).
   * @param {number} [options.volume=1.0] - Volume (0.0 to 1.0).
   * @param {Function} [options.onBoundary] - Called on each word boundary with { charIndex, name }.
   * @param {Function} [options.onEnd] - Called when speech finishes.
   */
  const speak = useCallback(
    (text, options = {}) => {
      if (!isTtsSupported) {
        console.warn('Text-to-Speech is not supported by this browser.');
        return;
      }

      // Stop any current utterance before starting a new one
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentWordIndex(-1);

      if (!text || !text.trim()) return;

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;

      // Configure speech parameters
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Select voice: specified voice -> default US English voice -> first available voice
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        const usVoice = voices.find((v) => v.lang === 'en-US') || voices[0];
        if (usVoice) utterance.voice = usVoice;
      }

      // Event: Word boundary (used for karaoke / real-time text highlighting)
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          setCurrentWordIndex(event.charIndex);
          if (options.onBoundary) {
            options.onBoundary(event);
          }
        }
      };

      // Event: Speech starts
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      // Event: Speech ends
      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
        if (options.onEnd) {
          options.onEnd();
        }
      };

      // Event: Speech errors
      utterance.onerror = (event) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          console.error('SpeechSynthesis error:', event.error);
        }
        setIsSpeaking(false);
        setCurrentWordIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isTtsSupported, voices]
  );

  /**
   * Stop any active speech utterance immediately.
   */
  const stopSpeaking = useCallback(() => {
    if (!isTtsSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentWordIndex(-1);
  }, [isTtsSupported]);

  // ==========================================================================
  // SPEECH-TO-TEXT (STT) METHODS
  // ==========================================================================

  /**
   * Start listening to user voice input via the microphone.
   *
   * @param {Object} [options] - Listening options.
   * @param {string} [options.lang='en-US'] - Language code (e.g., 'en-US', 'en-GB').
   * @param {boolean} [options.continuous=false] - Whether to keep listening continuously.
   * @param {Function} [options.onResult] - Callback receiving the final recognized text string.
   * @param {Function} [options.onError] - Callback receiving error details.
   */
  const startListening = useCallback(
    (options = {}) => {
      if (!isSttSupported) {
        const errMsg = 'Speech Recognition is not supported by this browser. Please use Google Chrome or Microsoft Edge.';
        setSpeechError(errMsg);
        if (options.onError) options.onError(errMsg);
        return;
      }

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      setSpeechError(null);
      setTranscript('');
      setInterimTranscript('');

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.lang = options.lang || 'en-US';
      recognition.continuous = options.continuous ?? false;
      // interimResults = true allows live streaming text while speaking
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Event: Recognition starts
      recognition.onstart = () => {
        setIsListening(true);
      };

      // Event: Audio results incoming
      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (currentFinal) {
          setTranscript((prev) => {
            const updated = prev ? `${prev} ${currentFinal}` : currentFinal;
            if (options.onResult) {
              options.onResult(updated.trim());
            }
            return updated.trim();
          });
          setInterimTranscript('');
        }
      };

      // Event: Recognition encounters error
      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        let friendlyMsg = `Speech error: ${event.error}`;
        if (event.error === 'not-allowed') {
          friendlyMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
        } else if (event.error === 'no-speech') {
          friendlyMsg = 'No speech detected. Please speak into the microphone.';
        }
        setSpeechError(friendlyMsg);
        setIsListening(false);
        if (options.onError) options.onError(friendlyMsg);
      };

      // Event: Recognition ends
      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setIsListening(false);
      }
    },
    [isSttSupported, SpeechRecognitionClass]
  );

  /**
   * Stop listening and conclude speech recognition.
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  return {
    // TTS Exports
    speak,
    stopSpeaking,
    isSpeaking,
    currentWordIndex,
    voices,
    isTtsSupported,

    // STT Exports
    startListening,
    stopListening,
    isListening,
    transcript,
    interimTranscript,
    speechError,
    isSttSupported,
  };
};

export default useSpeech;
