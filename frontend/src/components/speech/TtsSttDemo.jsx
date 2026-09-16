import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech';

/**
 * ============================================================================
 * Component: TtsSttDemo
 * ============================================================================
 * Interactive laboratory for testing Text-to-Speech (TTS) and Speech-to-Text (STT).
 * Provides granular controls for speech synthesis (voice selection, speed, pitch)
 * and real-time voice recognition transcription with audio level feedback.
 */
export default function TtsSttDemo() {
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    voices,
    isTtsSupported,
    startListening,
    stopListening,
    isListening,
    transcript,
    interimTranscript,
    speechError,
    isSttSupported,
  } = useSpeech();

  // TTS Control States
  const [ttsText, setTtsText] = useState(
    'The quick brown fox jumps over the lazy dog. Practice makes perfect!'
  );
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  // STT Output & Copy State
  const [copied, setCopied] = useState(false);

  // Sample phrases for quick TTS testing
  const samplePhrases = [
    'Ephemeral: lasting for a very short time.',
    'Could you please recommend a good coffee shop nearby?',
    'She sells seashells by the seashore.',
    'Consistency is the key to mastering any language.',
  ];

  /**
   * Handle text-to-speech execution
   */
  const handleSpeak = () => {
    const selectedVoice = voices[selectedVoiceIndex] || null;
    speak(ttsText, {
      voice: selectedVoice,
      rate: parseFloat(rate),
      pitch: parseFloat(pitch),
    });
  };

  /**
   * Toggle speech recognition recording
   */
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Copy transcribed voice text to clipboard
   */
  const handleCopyTranscript = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>🎙️ Core Speech Engine (TTS & STT)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Test and configure client-side voice synthesis and speech recognition with zero latency.
        </p>
      </div>

      <div className="grid-2">
        {/* ================================================================= */}
        {/* 1. TEXT-TO-SPEECH (TTS) PANEL */}
        {/* ================================================================= */}
        <div className="card">
          <div className="card-title">
            <span>🔊</span>
            <h3>Text-to-Speech (TTS)</h3>
          </div>
          <p className="card-subtitle">Convert any written text into natural spoken audio.</p>

          {!isTtsSupported ? (
            <div className="badge badge-danger">Text-to-Speech is not supported in this browser.</div>
          ) : (
            <>
              {/* Text Input Area */}
              <div className="form-group">
                <label className="form-label">Input Text to Read</label>
                <textarea
                  className="textarea-input"
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Enter words, sentences, or paragraphs..."
                  rows={4}
                />
              </div>

              {/* Sample Phrases Chips */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>
                  Sample phrases:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {samplePhrases.map((phrase, idx) => (
                    <button
                      key={idx}
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: '4px 8px' }}
                      onClick={() => setTtsText(phrase)}
                    >
                      {phrase.slice(0, 28)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selector */}
              <div className="form-group">
                <label className="form-label">Select Voice / Accent</label>
                <select
                  className="select-input"
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                >
                  {voices.map((voice, idx) => (
                    <option key={idx} value={idx}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Speed (Rate) Slider */}
              <div className="form-group">
                <div className="slider-container">
                  <label className="form-label" style={{ minWidth: 90, margin: 0 }}>
                    Speed: {rate}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    className="slider-input"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                  <span className="slider-value">{rate}x</span>
                </div>
              </div>

              {/* Speech Pitch Slider */}
              <div className="form-group">
                <div className="slider-container">
                  <label className="form-label" style={{ minWidth: 90, margin: 0 }}>
                    Pitch: {pitch}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    className="slider-input"
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                  />
                  <span className="slider-value">{pitch}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSpeak}
                  disabled={!ttsText.trim() || isSpeaking}
                >
                  {isSpeaking ? '🔊 Speaking...' : '▶ Play Speech'}
                </button>
                {isSpeaking && (
                  <button className="btn btn-danger" onClick={stopSpeaking}>
                    ⏹ Stop
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ================================================================= */}
        {/* 2. SPEECH-TO-TEXT (STT) PANEL */}
        {/* ================================================================= */}
        <div className="card">
          <div className="card-title">
            <span>🎤</span>
            <h3>Speech-to-Text (STT)</h3>
          </div>
          <p className="card-subtitle">Speak into your microphone to convert speech into text in real-time.</p>

          {!isSttSupported ? (
            <div className="badge badge-danger">
              Speech Recognition is not supported. Use Google Chrome or Microsoft Edge.
            </div>
          ) : (
            <>
              {/* Mic Activation Button with Animated Audio Waves */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                    onClick={handleToggleListening}
                  >
                    {isListening ? '⏹ Stop Listening' : '🎙 Start Speaking'}
                  </button>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {isListening ? 'Listening live...' : 'Click to activate microphone'}
                  </span>
                </div>

                {isListening && (
                  <div className="waveform-container">
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                    <div className="wave-bar" />
                  </div>
                )}
              </div>

              {/* Error Message Display */}
              {speechError && (
                <div className="badge badge-warning" style={{ marginBottom: 12, display: 'block' }}>
                  ⚠️ {speechError}
                </div>
              )}

              {/* Real-time Transcription Box */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Recognized Text:
                  </label>
                  {transcript && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={handleCopyTranscript}
                    >
                      {copied ? '✓ Copied!' : '📋 Copy Text'}
                    </button>
                  )}
                </div>

                <div
                  style={{
                    minHeight: 120,
                    padding: 14,
                    background: 'var(--bg-surface)',
                    border: isListening ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: transcript || interimTranscript ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {transcript && <span>{transcript} </span>}
                  {interimTranscript && (
                    <span style={{ color: 'var(--accent-info)', fontStyle: 'italic' }}>
                      {interimTranscript}...
                    </span>
                  )}
                  {!transcript && !interimTranscript && (
                    <span>Your spoken words will appear here in real-time...</span>
                  )}
                </div>
              </div>

              {/* Read Aloud Button for Transcribed Text */}
              {transcript && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => speak(transcript)}
                    disabled={isSpeaking}
                  >
                    🔊 Read Back My Speech
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
