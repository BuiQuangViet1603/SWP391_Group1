import React, { useState, useEffect } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import api from '../../services/api';

/**
 * ============================================================================
 * Component: VoiceSearch
 * ============================================================================
 * Enables voice-activated search ("Search Online Through Speech").
 *
 * Workflow:
 * 1. User clicks the microphone button and speaks their query (e.g. "Serendipity", "Deck").
 * 2. Speech-to-Text automatically captures the query and fills the search bar.
 * 3. Dual search is performed:
 *    - Internal database search: queries Spring Boot /api/search?q={query}.
 *    - Online Dictionary lookup: queries Free Dictionary API for definitions, IPA & audio.
 *    - Quick Web Links: provides direct shortcuts to Cambridge, Oxford, and Google.
 */
export default function VoiceSearch() {
  const { speak, startListening, stopListening, isListening, isSpeaking } = useSpeech();

  // Search input & state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Results state
  const [localResults, setLocalResults] = useState(null);
  const [onlineDictionary, setOnlineDictionary] = useState(null);
  const [dictionaryError, setDictionaryError] = useState(null);

  /**
   * Execute search across local database and online dictionary
   *
   * @param {string} query - Keyword to search
   */
  const performSearch = async (query) => {
    const trimmed = (query || searchQuery).trim();
    if (!trimmed) return;

    setIsSearching(true);
    setOnlineDictionary(null);
    setDictionaryError(null);

    // 1. Search local Spring Boot database (/api/search)
    try {
      const response = await api.get('/search', { params: { q: trimmed } });
      setLocalResults(response.data);
    } catch (err) {
      console.warn('Local search error (backend might be offline or empty):', err.message);
      setLocalResults({ flashcards: [], decks: [], totalCount: 0 });
    }

    // 2. Fetch definition from Online Free Dictionary API
    try {
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`
      );
      if (dictRes.ok) {
        const data = await dictRes.json();
        setOnlineDictionary(data[0]);
      } else {
        setDictionaryError('No online dictionary definition found for this term.');
      }
    } catch {
      setDictionaryError('Unable to connect to online dictionary service.');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Trigger Voice Search via microphone
   */
  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening({
      onResult: (spokenText) => {
        setSearchQuery(spokenText);
        performSearch(spokenText);
      },
    });
  };

  /**
   * Form submit handler
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>🔍 Search Online Through Speech</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Speak into the microphone to find vocabulary, flashcard decks, and instant online dictionary definitions.
        </p>
      </div>

      {/* ================================================================= */}
      {/* 1. VOICE SEARCH INPUT BAR */}
      {/* ================================================================= */}
      <div className="card" style={{ marginBottom: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="input-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Speak or type a word or topic (e.g., 'Perseverance', 'Biology')..."
              style={{ paddingRight: 48, fontSize: 16 }}
            />
            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Voice Search Microphone Button */}
          <button
            type="button"
            className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleVoiceSearch}
            title={isListening ? 'Stop Listening' : 'Speak to Search'}
            style={{ minWidth: 140 }}
          >
            {isListening ? (
              <>
                <span className="wave-bar" style={{ height: 14 }} />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <span>🎙️</span>
                <span>Speak</span>
              </>
            )}
          </button>

          {/* Regular Search Button */}
          <button type="submit" className="btn btn-secondary" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Try saying:</span>
          {['Eloquent', 'Resilient', 'Flashcards', 'Adventure', 'Technology'].map((word) => (
            <button
              key={word}
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '3px 10px' }}
              onClick={() => {
                setSearchQuery(word);
                performSearch(word);
              }}
            >
              "{word}"
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. RESULTS CONTAINER */}
      {/* ================================================================= */}
      {(localResults || onlineDictionary || dictionaryError) && (
        <div className="grid-2">
          {/* ONLINE DICTIONARY RESULTS */}
          <div className="card">
            <div className="card-title">
              <span>📖</span>
              <h3>Online Dictionary Definition</h3>
            </div>
            <p className="card-subtitle">Real-time English definitions and IPA phonetics</p>

            {onlineDictionary ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <h4 style={{ fontSize: 22, color: 'var(--text-primary)' }}>
                    {onlineDictionary.word}
                  </h4>
                  {onlineDictionary.phonetic && (
                    <span className="badge badge-info" style={{ fontSize: 14 }}>
                      {onlineDictionary.phonetic}
                    </span>
                  )}
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => speak(onlineDictionary.word)}
                    disabled={isSpeaking}
                  >
                    🔊 Listen
                  </button>
                </div>

                {/* Meanings & Definitions */}
                {onlineDictionary.meanings?.slice(0, 3).map((m, mIdx) => (
                  <div
                    key={mIdx}
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <span
                      className="badge badge-warning"
                      style={{ fontSize: 11, marginBottom: 6 }}
                    >
                      {m.partOfSpeech}
                    </span>
                    <p style={{ fontSize: 14, marginTop: 6, color: 'var(--text-primary)' }}>
                      {m.definitions[0]?.definition}
                    </p>
                    {m.definitions[0]?.example && (
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--accent-info)',
                          fontStyle: 'italic',
                          marginTop: 4,
                        }}
                      >
                        Example: "{m.definitions[0].example}"
                      </p>
                    )}
                  </div>
                ))}

                {/* External Online Web Search Links */}
                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                    Search more online on:
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <a
                      href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(
                        onlineDictionary.word
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}
                    >
                      ↗ Cambridge Dictionary
                    </a>
                    <a
                      href={`https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(
                        onlineDictionary.word
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}
                    >
                      ↗ Oxford Learner's
                    </a>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        onlineDictionary.word + ' definition'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}
                    >
                      ↗ Google
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {dictionaryError || 'Type or speak a word above to see dictionary definition.'}
              </p>
            )}
          </div>

          {/* LOCAL DATABASE RESULTS */}
          <div className="card">
            <div className="card-title">
              <span>📚</span>
              <h3>Local Flashcards & Decks</h3>
            </div>
            <p className="card-subtitle">Matches found in your study database</p>

            {localResults && localResults.totalCount > 0 ? (
              <div>
                {/* Decks found */}
                {localResults.decks?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h5 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      DECKS ({localResults.decks.length})
                    </h5>
                    {localResults.decks.map((deck) => (
                      <div
                        key={deck.id}
                        style={{
                          padding: 10,
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>📁 {deck.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {deck.description || 'No description'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Flashcards found */}
                {localResults.flashcards?.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      FLASHCARDS ({localResults.flashcards.length})
                    </h5>
                    {localResults.flashcards.map((card) => (
                      <div
                        key={card.id}
                        style={{
                          padding: 12,
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {card.vocabulary}
                          </span>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={() => speak(card.vocabulary)}
                          >
                            🔊 Listen
                          </button>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                          {card.meaning}
                        </div>
                        {card.exampleSentence && (
                          <div style={{ fontSize: 12, color: 'var(--accent-info)', fontStyle: 'italic', marginTop: 4 }}>
                            "{card.exampleSentence}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No matching flashcards or decks found in local database for "{searchQuery}".</p>
                <span style={{ fontSize: 12 }}>Check online dictionary on the left!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
