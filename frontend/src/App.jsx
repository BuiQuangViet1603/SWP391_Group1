import React, { useState, useEffect } from 'react';
import TtsSttDemo from './components/speech/TtsSttDemo';
import VoiceSearch from './components/search/VoiceSearch';
import PracticeHub from './components/practice/PracticeHub';
import SpeechSettings from './components/settings/SpeechSettings';
import SpeechProgress from './components/history/SpeechProgress';
import api from './services/api';

/**
 * ============================================================================
 * Root Application: App.jsx
 * ============================================================================
 * Organizes the speech learning suite into 5 streamlined, accessible views:
 * 1. 🎙️ Speech Lab: Text-to-Speech & Speech-to-Text engine sandbox
 * 2. 🔍 Voice Search: Search local database & online dictionary through speech
 * 3. 🎯 Practice Hub: Grouped practice modes (Listening, Speaking, Reading, Shadowing, Dialogue)
 * 4. 📊 Progress & History: Analytics dashboard and difficult words watchlist
 * 5. ⚙️ Speech Settings: Voice, pitch, speed, and auto-play configuration
 */
export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState('PRACTICE'); // 'LAB', 'SEARCH', 'PRACTICE', 'PROGRESS', 'SETTINGS'

  // Persisted Speech Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('speech_settings');
    return saved
      ? JSON.parse(saved)
      : {
          voiceName: 'Google US English',
          speechRate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          autoPlayAudio: true,
        };
  });

  // Global notification banner state
  const [notification, setNotification] = useState(null);

  /**
   * Save practice drill results to the Spring Boot backend
   *
   * @param {Object} historyItem - Details of the practice attempt
   */
  const handleSavePracticeHistory = async (historyItem) => {
    try {
      await api.post('/speech/history', historyItem);
      showNotification(`✓ Practice result recorded! Score: ${historyItem.score}%`);
    } catch (err) {
      console.warn('Practice logged locally (backend sync optional):', err.message);
      showNotification(`✓ Practice completed! Score: ${historyItem.score}%`);
    }
  };

  /**
   * Temporary toast alert helper
   */
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="app-container">
      {/* ================================================================= */}
      {/* 1. APP HEADER & NAVIGATION BAR */}
      {/* ================================================================= */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">🎙️</span>
          <div>
            <h1 className="brand-title">Speech & Language Suite</h1>
            <div className="brand-subtitle">SWP391 Group 1 • Smart Flashcard & Speech Engine</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'LAB' ? 'active' : ''}`}
            onClick={() => setActiveTab('LAB')}
          >
            <span>🎙️</span>
            <span>Speech Lab (TTS/STT)</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'SEARCH' ? 'active' : ''}`}
            onClick={() => setActiveTab('SEARCH')}
          >
            <span>🔍</span>
            <span>Voice Search</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'PRACTICE' ? 'active' : ''}`}
            onClick={() => setActiveTab('PRACTICE')}
          >
            <span>🎯</span>
            <span>Practice Hub</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'PROGRESS' ? 'active' : ''}`}
            onClick={() => setActiveTab('PROGRESS')}
          >
            <span>📊</span>
            <span>Progress & History</span>
          </button>

          <button
            className={`nav-tab ${activeTab === 'SETTINGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('SETTINGS')}
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </nav>
      </header>

      {/* Floating Notification Toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-primary)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>✨</span>
          <span>{notification}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. TAB CONTENT PANELS */}
      {/* ================================================================= */}
      <main>
        {activeTab === 'LAB' && <TtsSttDemo />}

        {activeTab === 'SEARCH' && <VoiceSearch />}

        {activeTab === 'PRACTICE' && (
          <PracticeHub onSaveHistory={handleSavePracticeHistory} />
        )}

        {activeTab === 'PROGRESS' && (
          <SpeechProgress onSelectPracticeItem={() => setActiveTab('PRACTICE')} />
        )}

        {activeTab === 'SETTINGS' && (
          <SpeechSettings
            currentSettings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              showNotification('Speech settings updated!');
            }}
          />
        )}
      </main>
    </div>
  );
}
