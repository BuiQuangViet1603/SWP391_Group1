import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../../hooks/useSpeech';
import { evaluatePronunciation } from '../../utils/pronunciationEvaluator';
import PronunciationScoreCard from './PronunciationScoreCard';

/**
 * ============================================================================
 * Component: PracticeHub
 * ============================================================================
 * Unified practice center grouping all language learning exercises under
 * the PracticeType enumeration:
 * 1. LISTENING: Audio-based cloze dictation & multiple choice comprehension
 * 2. SPEAKING: Target phrase pronunciation with real-time accuracy scoring
 * 3. READING: Passage reading with synchronized Karaoke-style word highlighting
 * 4. SHADOWING: 3-step imitation drill (Listen -> Countdown -> Repeat & Compare)
 * 5. CONVERSATION: Interactive multi-turn dialogue simulation
 */
export default function PracticeHub({ onSaveHistory }) {
  const {
    speak,
    stopSpeaking,
    isSpeaking,
    currentWordIndex,
    startListening,
    stopListening,
    isListening,
    transcript,
    interimTranscript,
    speechError,
  } = useSpeech();

  // Active Practice Type Tab
  const [activeType, setActiveType] = useState('SPEAKING'); // LISTENING, SPEAKING, READING, SHADOWING, CONVERSATION

  // ==========================================================================
  // PRACTICE EXERCISE DATASETS
  // ==========================================================================

  // 1. Speaking Exercises
  const speakingItems = [
    {
      id: 1,
      target: 'Pronunciation is the way in which a word or language is spoken.',
      phonetic: '/prəˌnʌn.siˈeɪ.ʃən/',
      level: 'Intermediate',
    },
    {
      id: 2,
      target: 'Consistency and curiosity are vital for mastering English.',
      phonetic: '/kənˈsɪs.tən.si ænd ˌkjʊə.riˈɒs.ə.ti/',
      level: 'Advanced',
    },
    {
      id: 3,
      target: 'Could I please have a cup of black coffee without sugar?',
      phonetic: '/kʊd aɪ pliːz hæv ə kʌp əv blæk ˈkɒf.i/',
      level: 'Daily Life',
    },
  ];

  // 2. Listening Exercises
  const listeningItems = [
    {
      id: 1,
      audioText: 'The meeting has been rescheduled to Thursday afternoon.',
      question: 'Listen carefully and fill in the missing word:',
      clozeTemplate: 'The meeting has been ________ to Thursday afternoon.',
      correctAnswer: 'rescheduled',
      options: ['canceled', 'rescheduled', 'delayed', 'confirmed'],
    },
    {
      id: 2,
      audioText: 'Artificial intelligence is transforming education worldwide.',
      question: 'Listen and choose the main topic mentioned:',
      clozeTemplate: 'Artificial intelligence is transforming ________ worldwide.',
      correctAnswer: 'education',
      options: ['business', 'healthcare', 'education', 'transportation'],
    },
  ];

  // 3. Reading Passage with Karaoke
  const readingPassage = {
    title: 'The Art of Mindful Communication',
    text: 'Clear communication begins with active listening. When we listen with genuine intention, we build trust and understanding across different cultures.',
  };

  // 4. Shadowing Drill
  const shadowingSentence = 'Learning a new language opens doors to countless opportunities and lifelong friendships.';

  // 5. Conversation Dialogue Scenario
  const conversationScenario = {
    title: 'Ordering at a Specialty Cafe',
    turns: [
      {
        speaker: 'Barista (AI)',
        text: 'Hi there! Welcome to Sunrise Coffee. What can I get started for you today?',
      },
      {
        speaker: 'You',
        prompt: 'Order a large iced caramel latte with oat milk.',
        expectedKeywords: ['latte', 'caramel', 'oat milk', 'iced'],
      },
      {
        speaker: 'Barista (AI)',
        text: 'Great choice! Would you like any pastries or snacks to go with that?',
      },
      {
        speaker: 'You',
        prompt: 'Say you would just like a chocolate chip cookie, please.',
        expectedKeywords: ['cookie', 'chocolate', 'please'],
      },
    ],
  };

  // ==========================================================================
  // STATE MANAGEMENT PER PRACTICE MODE
  // ==========================================================================

  // Speaking State
  const [speakingIndex, setSpeakingIndex] = useState(0);
  const [speakingEvaluation, setSpeakingEvaluation] = useState(null);

  // Listening State
  const [listeningIndex, setListeningIndex] = useState(0);
  const [listeningUserInput, setListeningUserInput] = useState('');
  const [listeningFeedback, setListeningFeedback] = useState(null);

  // Shadowing State
  const [shadowingStep, setShadowingStep] = useState(1); // 1: Listen, 2: Countdown, 3: Speak, 4: Result
  const [shadowingCountdown, setShadowingCountdown] = useState(3);
  const [shadowingEvaluation, setShadowingEvaluation] = useState(null);
  const countdownTimerRef = useRef(null);

  // Conversation State
  const [conversationStep, setConversationStep] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([
    { speaker: 'Barista (AI)', text: conversationScenario.turns[0].text },
  ]);
  const [conversationUserSpoken, setConversationUserSpoken] = useState('');

  // ==========================================================================
  // HANDLERS: SPEAKING PRACTICE
  // ==========================================================================
  const currentSpeakingItem = speakingItems[speakingIndex];

  const handleStartSpeakingPractice = () => {
    setSpeakingEvaluation(null);
    startListening({
      onResult: (spoken) => {
        const evalResult = evaluatePronunciation(currentSpeakingItem.target, spoken);
        setSpeakingEvaluation(evalResult);

        // Save history to backend if callback available
        if (onSaveHistory) {
          onSaveHistory({
            practiceType: 'SPEAKING',
            targetText: currentSpeakingItem.target,
            recognizedText: spoken,
            score: evalResult.overallScore,
            fluencyScore: evalResult.fluencyScore,
            accuracyScore: evalResult.completenessScore,
          });
        }
      },
    });
  };

  // ==========================================================================
  // HANDLERS: LISTENING PRACTICE
  // ==========================================================================
  const currentListeningItem = listeningItems[listeningIndex];

  const handlePlayListeningAudio = () => {
    speak(currentListeningItem.audioText, { rate: 0.9 });
  };

  const handleCheckListeningAnswer = (selectedOption = null) => {
    const answerToCheck = selectedOption || listeningUserInput.trim();
    const isCorrect =
      answerToCheck.toLowerCase() === currentListeningItem.correctAnswer.toLowerCase();

    setListeningFeedback({
      isCorrect,
      message: isCorrect
        ? '🎉 Correct! You listened accurately.'
        : `❌ Incorrect. The correct word was "${currentListeningItem.correctAnswer}".`,
      transcript: currentListeningItem.audioText,
    });

    if (onSaveHistory) {
      onSaveHistory({
        practiceType: 'LISTENING',
        targetText: currentListeningItem.audioText,
        recognizedText: answerToCheck,
        score: isCorrect ? 100 : 40,
        fluencyScore: 100,
        accuracyScore: isCorrect ? 100 : 40,
      });
    }
  };

  // ==========================================================================
  // HANDLERS: SHADOWING PRACTICE
  // ==========================================================================
  const handleStartShadowing = () => {
    setShadowingStep(1);
    setShadowingEvaluation(null);

    // Step 1: Speak sample
    speak(shadowingSentence, {
      rate: 0.85,
      onEnd: () => {
        // Step 2: Start 3-second countdown
        setShadowingStep(2);
        setShadowingCountdown(3);

        let count = 3;
        countdownTimerRef.current = setInterval(() => {
          count -= 1;
          setShadowingCountdown(count);
          if (count === 0) {
            clearInterval(countdownTimerRef.current);
            // Step 3: Activate microphone for user repetition
            setShadowingStep(3);
            startListening({
              onResult: (spoken) => {
                const evalResult = evaluatePronunciation(shadowingSentence, spoken);
                setShadowingEvaluation(evalResult);
                setShadowingStep(4);

                if (onSaveHistory) {
                  onSaveHistory({
                    practiceType: 'SHADOWING',
                    targetText: shadowingSentence,
                    recognizedText: spoken,
                    score: evalResult.overallScore,
                    fluencyScore: evalResult.fluencyScore,
                    accuracyScore: evalResult.completenessScore,
                  });
                }
              },
            });
          }
        }, 1000);
      },
    });
  };

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // ==========================================================================
  // HANDLERS: CONVERSATION PRACTICE
  // ==========================================================================
  const handleConversationMic = () => {
    startListening({
      onResult: (spoken) => {
        setConversationUserSpoken(spoken);

        const currentTurn = conversationScenario.turns[conversationStep + 1];
        if (!currentTurn) return;

        // Check if spoken text contains expected keywords
        const lowerSpoken = spoken.toLowerCase();
        const matches = currentTurn.expectedKeywords.filter((k) =>
          lowerSpoken.includes(k.toLowerCase())
        );
        const turnScore = Math.round(
          (matches.length / currentTurn.expectedKeywords.length) * 100
        );

        // Update history with User response
        const nextTurns = [
          ...conversationHistory,
          { speaker: 'You', text: spoken, score: turnScore },
        ];

        // If there is a subsequent AI response, append it and speak it
        const nextAiTurn = conversationScenario.turns[conversationStep + 2];
        if (nextAiTurn) {
          nextTurns.push({ speaker: nextAiTurn.speaker, text: nextAiTurn.text });
          setConversationHistory(nextTurns);
          setConversationStep((prev) => prev + 2);
          setTimeout(() => {
            speak(nextAiTurn.text);
          }, 600);
        } else {
          setConversationHistory(nextTurns);
          setConversationStep((prev) => prev + 1);
        }

        if (onSaveHistory) {
          onSaveHistory({
            practiceType: 'CONVERSATION',
            targetText: currentTurn.prompt,
            recognizedText: spoken,
            score: Math.max(50, turnScore),
            fluencyScore: 85,
            accuracyScore: turnScore,
          });
        }
      },
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>🎯 Practice Hub (Grouped by Type)</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Master English with structured practice: Listening, Speaking, Reading, Shadowing, and Dialogue.
        </p>
      </div>

      {/* ================================================================= */}
      {/* PRACTICE TYPE SELECTOR TABS */}
      {/* ================================================================= */}
      <div className="nav-tabs" style={{ marginBottom: 24 }}>
        {[
          { key: 'SPEAKING', icon: '🗣️', label: 'Speaking & Pronunciation' },
          { key: 'LISTENING', icon: '🎧', label: 'Listening Comprehension' },
          { key: 'READING', icon: '📖', label: 'Reading with Karaoke' },
          { key: 'SHADOWING', icon: '👥', label: 'Shadowing Drill' },
          { key: 'CONVERSATION', icon: '💬', label: 'Conversation Practice' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`nav-tab ${activeType === tab.key ? 'active' : ''}`}
            onClick={() => {
              setActiveType(tab.key);
              stopSpeaking();
              stopListening();
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* 1. SPEAKING PRACTICE & PRONUNCIATION ASSESSMENT */}
      {/* ================================================================= */}
      {activeType === 'SPEAKING' && (
        <div className="card">
          <div className="card-title">
            <span>🗣️</span>
            <h3>Speaking Practice & Pronunciation Assessment</h3>
          </div>
          <p className="card-subtitle">
            Speak the sentence below. Our assessment engine analyzes your phonetics and scores your accuracy.
          </p>

          {/* Exercise Selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {speakingItems.map((item, idx) => (
              <button
                key={item.id}
                className={`btn ${speakingIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, padding: '4px 12px' }}
                onClick={() => {
                  setSpeakingIndex(idx);
                  setSpeakingEvaluation(null);
                }}
              >
                Sentence {idx + 1} ({item.level})
              </button>
            ))}
          </div>

          {/* Target Sentence Card */}
          <div
            style={{
              padding: 24,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span className="badge badge-info" style={{ marginBottom: 10 }}>
              Target Sentence:
            </span>
            <h3 style={{ fontSize: 20, lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: 8 }}>
              "{currentSpeakingItem.target}"
            </h3>
            <p style={{ fontSize: 14, color: 'var(--accent-info)', fontFamily: 'monospace' }}>
              IPA: {currentSpeakingItem.phonetic}
            </p>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => speak(currentSpeakingItem.target)}
              disabled={isSpeaking}
            >
              🔊 Listen to Model Audio
            </button>

            <button
              className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
              onClick={isListening ? stopListening : handleStartSpeakingPractice}
            >
              {isListening ? '⏹ Stop Speaking' : '🎙️ Tap to Speak Sentence'}
            </button>

            {isListening && (
              <div className="waveform-container">
                <div className="wave-bar" />
                <div className="wave-bar" />
                <div className="wave-bar" />
              </div>
            )}
          </div>

          {/* Live Transcript Display */}
          {(transcript || interimTranscript) && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>You said: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{transcript || interimTranscript}</strong>
            </div>
          )}

          {/* Pronunciation Assessment Result Card */}
          {speakingEvaluation && (
            <PronunciationScoreCard
              evaluation={speakingEvaluation}
              targetText={currentSpeakingItem.target}
              onListenSample={(txt) => speak(txt)}
            />
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. LISTENING PRACTICE (Audio Prompt & Cloze / Quiz) */}
      {/* ================================================================= */}
      {activeType === 'LISTENING' && (
        <div className="card">
          <div className="card-title">
            <span>🎧</span>
            <h3>Listening Comprehension & Dictation</h3>
          </div>
          <p className="card-subtitle">
            Listen to the spoken audio and identify the missing word or answer the question.
          </p>

          <div
            style={{
              padding: 24,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <button
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: 16, marginBottom: 14 }}
              onClick={handlePlayListeningAudio}
            >
              🔊 {isSpeaking ? 'Playing Audio...' : 'Click to Play Audio'}
            </button>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              (Audio text is hidden to test your listening skills)
            </p>
          </div>

          {/* Question & Cloze sentence */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>{currentListeningItem.question}</h4>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              {currentListeningItem.clozeTemplate}
            </p>

            {/* Multiple Choice Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {currentListeningItem.options.map((opt) => (
                <button
                  key={opt}
                  className="btn btn-secondary"
                  style={{ padding: 12, fontSize: 15, justifyContent: 'flex-start' }}
                  onClick={() => handleCheckListeningAnswer(opt)}
                >
                  🔘 {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Display */}
          {listeningFeedback && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 'var(--radius-sm)',
                background: listeningFeedback.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: listeningFeedback.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <h4 style={{ color: listeningFeedback.isCorrect ? '#34d399' : '#f87171', marginBottom: 4 }}>
                {listeningFeedback.message}
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Full Transcript: <i>"{listeningFeedback.transcript}"</i>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. READING PRACTICE (Karaoke Highlighting Sync) */}
      {/* ================================================================= */}
      {activeType === 'READING' && (
        <div className="card">
          <div className="card-title">
            <span>📖</span>
            <h3>Reading Practice (Karaoke-Style Synchronized Audio)</h3>
          </div>
          <p className="card-subtitle">
            Listen and follow along. Each word highlights in real-time as it is pronounced.
          </p>

          <div
            style={{
              padding: 24,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
            }}
          >
            <h4 style={{ fontSize: 18, color: 'var(--accent-info)', marginBottom: 14 }}>
              {readingPassage.title}
            </h4>

            {/* Karaoke Highlight Text Display */}
            <div className="karaoke-text">
              {readingPassage.text.split(' ').map((word, wIdx) => {
                // Approximate word match based on current character index from utterance.onboundary
                const isActive = isSpeaking && currentWordIndex >= 0;
                return (
                  <span
                    key={wIdx}
                    className={`karaoke-word ${isActive ? 'active' : ''}`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={() => speak(readingPassage.text, { rate: 0.85 })}
              disabled={isSpeaking}
            >
              {isSpeaking ? '🔊 Reading Along...' : '▶ Start Karaoke Read-Along'}
            </button>
            {isSpeaking && (
              <button className="btn btn-danger" onClick={stopSpeaking}>
                ⏹ Pause / Stop
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. SHADOWING PRACTICE (3-Step Imitation Loop) */}
      {/* ================================================================= */}
      {activeType === 'SHADOWING' && (
        <div className="card">
          <div className="card-title">
            <span>👥</span>
            <h3>Shadowing Practice (Imitation Drill)</h3>
          </div>
          <p className="card-subtitle">
            Proven linguistic method: System reads $\to$ Countdown $\to$ You imitate rhythm and intonation $\to$ Instant feedback.
          </p>

          {/* Stepper Progress Bar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[
              { num: 1, title: 'Listen' },
              { num: 2, title: 'Countdown' },
              { num: 3, title: 'Repeat (Mic)' },
              { num: 4, title: 'Evaluation' },
            ].map((st) => (
              <div
                key={st.num}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center',
                  background: shadowingStep >= st.num ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: shadowingStep >= st.num ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Step {st.num}: {st.title}
              </div>
            ))}
          </div>

          {/* Drill Sentence Box */}
          <div
            style={{
              padding: 24,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              "{shadowingSentence}"
            </p>

            {shadowingStep === 2 && (
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent-warning)' }}>
                Get ready in: {shadowingCountdown}...
              </div>
            )}

            {shadowingStep === 3 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span className="wave-bar" style={{ height: 20 }} />
                <span style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>
                  🎙️ SPEAK NOW: Repeat the sentence!
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleStartShadowing}
              disabled={isSpeaking || shadowingStep === 2 || shadowingStep === 3}
            >
              🚀 Start Shadowing Drill
            </button>
          </div>

          {/* Shadowing Score Result */}
          {shadowingEvaluation && (
            <PronunciationScoreCard
              evaluation={shadowingEvaluation}
              targetText={shadowingSentence}
              onListenSample={(txt) => speak(txt)}
            />
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. CONVERSATION PRACTICE (Interactive Simulated Dialogue) */}
      {/* ================================================================= */}
      {activeType === 'CONVERSATION' && (
        <div className="card">
          <div className="card-title">
            <span>💬</span>
            <h3>Conversation Practice (Roleplay Dialogue)</h3>
          </div>
          <p className="card-subtitle">
            Scenario: <strong>{conversationScenario.title}</strong>. Practice real-world spoken back-and-forth exchanges.
          </p>

          {/* Chat Transcript Log */}
          <div
            style={{
              padding: 16,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              minHeight: 220,
              maxHeight: 340,
              overflowY: 'auto',
              marginBottom: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {conversationHistory.map((msg, idx) => {
              const isAi = msg.speaker.includes('AI');
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '80%',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isAi ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    border: isAi ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 2 }}>
                    {msg.speaker} {msg.score !== undefined && `(Match: ${msg.score}%)`}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{msg.text}</div>
                </div>
              );
            })}
          </div>

          {/* User Prompt Guidance */}
          {conversationScenario.turns[conversationStep + 1] ? (
            <div
              style={{
                padding: 16,
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 16,
              }}
            >
              <span className="badge badge-warning" style={{ marginBottom: 6 }}>
                Your Turn to Reply:
              </span>
              <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                Prompt: "{conversationScenario.turns[conversationStep + 1].prompt}"
              </p>
            </div>
          ) : (
            <div className="badge badge-success" style={{ marginBottom: 16 }}>
              🎉 Scenario completed! Excellent conversation practice.
            </div>
          )}

          {/* Mic Interaction */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
              onClick={isListening ? stopListening : handleConversationMic}
              disabled={!conversationScenario.turns[conversationStep + 1]}
            >
              {isListening ? '⏹ Stop Speaking' : '🎙️ Speak Your Response'}
            </button>
            {isListening && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Listening to your response...</span>}
          </div>
        </div>
      )}
    </div>
  );
}
