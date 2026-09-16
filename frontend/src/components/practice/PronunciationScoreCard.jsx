import React from 'react';

/**
 * ============================================================================
 * Component: PronunciationScoreCard
 * ============================================================================
 * Displays visual evaluation results for spoken pronunciation:
 * - Circular/Badge Overall Score (0 - 100)
 * - Fluency & Completeness metrics
 * - Word-by-word color-coded chips (Green: correct, Yellow: partial, Red: missed)
 * - Qualitative feedback and audio replay
 */
export default function PronunciationScoreCard({ evaluation, targetText, onListenSample }) {
  if (!evaluation) return null;

  const { overallScore, fluencyScore, completenessScore, wordEvaluations, feedback } = evaluation;

  // Determine badge color theme based on score
  const getScoreColor = (score) => {
    if (score >= 85) return 'var(--accent-success)';
    if (score >= 70) return 'var(--accent-primary)';
    if (score >= 50) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  const scoreColor = getScoreColor(overallScore);

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${scoreColor}40`,
      }}
    >
      {/* Top Header: Score & Metrics */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Big Score Dial */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `radial-gradient(circle, ${scoreColor}22 0%, transparent 80%)`,
              border: `3px solid ${scoreColor}`,
              boxShadow: `0 0 16px ${scoreColor}44`,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor }}>{overallScore}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</span>
          </div>

          <div>
            <h4 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Pronunciation Assessment</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{feedback}</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Fluency</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{fluencyScore}%</span>
          </div>

          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Completeness</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{completenessScore}%</span>
          </div>
        </div>
      </div>

      {/* Word-by-Word Colored Breakdown */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Word-by-Word Analysis:
          </span>
          {onListenSample && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => onListenSample(targetText)}
            >
              🔊 Replay Target
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {wordEvaluations?.map((item, idx) => {
            let chipClass = 'word-diff-chip ';
            let label = 'Correct';
            if (item.status === 'correct') {
              chipClass += 'correct';
              label = '100%';
            } else if (item.status === 'partial') {
              chipClass += 'partial';
              label = `${item.score}%`;
            } else {
              chipClass += 'missed';
              label = 'Missed';
            }

            return (
              <div key={idx} className={chipClass}>
                <span>{item.word}</span>
                <span className="word-diff-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-success)' }} />
          Green: Accurate
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-warning)' }} />
          Yellow: Partial / Close
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-danger)' }} />
          Red: Mispronounced / Missed
        </span>
      </div>
    </div>
  );
}
