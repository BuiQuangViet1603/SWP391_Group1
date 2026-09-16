import React, { useState, useEffect } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import api from '../../services/api';

/**
 * ============================================================================
 * Component: SpeechSettings
 * ============================================================================
 * Allows the learner to customize speech synthesis preferences:
 * - Preferred voice / accent (US, UK, AU, etc.)
 * - Speech rate (0.5x to 2.0x)
 * - Pitch (0.5 to 1.5)
 * - Volume (0% to 100%)
 * - Auto-play audio toggle for flashcards
 *
 * Automatically persists settings to browser localStorage and synchronizes
 * with Spring Boot backend (/api/speech/settings).
 */
export default function SpeechSettings({ currentSettings, onUpdateSettings }) {
  const { voices, speak, isSpeaking } = useSpeech();

  const [voiceName, setVoiceName] = useState(
    currentSettings?.voiceName || 'Google US English'
  );
  const [speechRate, setSpeechRate] = useState(currentSettings?.speechRate || 1.0);
  const [pitch, setPitch] = useState(currentSettings?.pitch || 1.0);
  const [volume, setVolume] = useState(currentSettings?.volume || 1.0);
  const [autoPlayAudio, setAutoPlayAudio] = useState(
    currentSettings?.autoPlayAudio ?? true
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if props change
  useEffect(() => {
    if (currentSettings) {
      if (currentSettings.voiceName) setVoiceName(currentSettings.voiceName);
      if (currentSettings.speechRate) setSpeechRate(currentSettings.speechRate);
      if (currentSettings.pitch) setPitch(currentSettings.pitch);
      if (currentSettings.volume !== undefined) setVolume(currentSettings.volume);
      if (currentSettings.autoPlayAudio !== undefined)
        setAutoPlayAudio(currentSettings.autoPlayAudio);
    }
  }, [currentSettings]);

  /**
   * Test current voice settings with sample audio
   */
  const handleTestAudio = () => {
    const chosenVoice = voices.find((v) => v.name === voiceName) || null;
    speak('Hello! This is a preview of your personalized speech settings.', {
      voice: chosenVoice,
      rate: parseFloat(speechRate),
      pitch: parseFloat(pitch),
      volume: parseFloat(volume),
    });
  };

  /**
   * Save settings locally and send to backend
   */
  const handleSaveSettings = async () => {
    const updated = {
      voiceName,
      speechRate: parseFloat(speechRate),
      pitch: parseFloat(pitch),
      volume: parseFloat(volume),
      autoPlayAudio,
    };

    // 1. Save to localStorage
    localStorage.setItem('speech_settings', JSON.stringify(updated));

    // 2. Notify parent component
    if (onUpdateSettings) {
      onUpdateSettings(updated);
    }

    // 3. Sync to Spring Boot backend
    try {
      await api.put('/speech/settings', updated);
    } catch (err) {
      console.warn('Settings saved locally; backend sync skipped:', err.message);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>⚙️ Speech Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Personalize audio pitch, speed, voice accents, and auto-play options.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        {/* Voice Accent Picker */}
        <div className="form-group">
          <label className="form-label">Preferred Voice & Accent</label>
          <select
            className="select-input"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
          >
            {voices.map((v, i) => (
              <option key={i} value={v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Speed Slider */}
        <div className="form-group">
          <div className="slider-container">
            <label className="form-label" style={{ minWidth: 140, margin: 0 }}>
              Speed: {speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              className="slider-input"
              value={speechRate}
              onChange={(e) => setSpeechRate(e.target.value)}
            />
            <span className="slider-value">{speechRate}x</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Recommended: 0.8x for beginner shadowing; 1.0x for standard conversations.
          </span>
        </div>

        {/* Pitch Slider */}
        <div className="form-group">
          <div className="slider-container">
            <label className="form-label" style={{ minWidth: 140, margin: 0 }}>
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

        {/* Volume Slider */}
        <div className="form-group">
          <div className="slider-container">
            <label className="form-label" style={{ minWidth: 140, margin: 0 }}>
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              className="slider-input"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            />
            <span className="slider-value">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Auto-Play Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Auto-Play Audio on Flashcards</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Automatically pronounce words whenever a flashcard is revealed
            </div>
          </div>
          <input
            type="checkbox"
            style={{ width: 20, height: 20, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            checked={autoPlayAudio}
            onChange={(e) => setAutoPlayAudio(e.target.checked)}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleTestAudio} disabled={isSpeaking}>
            🔊 Test Audio
          </button>
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            💾 Save Settings
          </button>
          {savedSuccess && (
            <span className="badge badge-success" style={{ marginLeft: 8 }}>
              ✓ Settings saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
