/**
 * ============================================================================
 * Utility: pronunciationEvaluator.js
 * ============================================================================
 * Evaluates spoken speech against a target sentence to produce word-level
 * accuracy classifications, an overall percentage score, and actionable tips.
 *
 * Word Classifications:
 * - 'correct' (Green):  Spoken word matches target accurately (>= 88% similarity)
 * - 'partial' (Yellow): Minor typo, missing inflection, or phonetically close (>= 60%)
 * - 'missed' (Red):     Target word omitted or completely mispronounced (< 60%)
 * - 'extra' (Gray):     Unprompted words spoken by user
 */

/**
 * Clean and normalize text by converting to lowercase, expanding common
 * contractions, and removing punctuation.
 *
 * @param {string} text - Raw input string
 * @returns {string[]} Array of clean lowercase word tokens
 */
export const tokenize = (text) => {
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/can't/g, 'can not')
    .replace(/won't/g, 'will not')
    .replace(/n't/g, ' not')
    .replace(/'re/g, ' are')
    .replace(/'s/g, ' is')
    .replace(/'d/g, ' would')
    .replace(/'ll/g, ' will')
    .replace(/'ve/g, ' have')
    .replace(/'m/g, ' am')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  return normalized.split(/\s+/).filter(Boolean);
};

/**
 * Calculate Levenshtein Distance between two strings.
 */
export const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Calculate word similarity ratio between 0.0 and 1.0.
 */
export const wordSimilarity = (w1, w2) => {
  if (w1 === w2) return 1.0;
  const maxLen = Math.max(w1.length, w2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(w1, w2);
  return 1.0 - dist / maxLen;
};

/**
 * Comprehensive pronunciation assessment of spoken speech against target text.
 *
 * @param {string} targetText - The sentence the student was instructed to say
 * @param {string} spokenText - The transcription returned by SpeechRecognition
 * @returns {Object} Evaluation summary with score, fluency, and word details
 */
export const evaluatePronunciation = (targetText = '', spokenText = '') => {
  const targetWords = tokenize(targetText);
  const spokenWords = tokenize(spokenText);

  if (targetWords.length === 0) {
    return {
      overallScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      wordEvaluations: [],
      feedback: 'Target text is missing.',
    };
  }

  if (spokenWords.length === 0) {
    return {
      overallScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      wordEvaluations: targetWords.map((w) => ({
        word: w,
        status: 'missed',
        score: 0,
      })),
      feedback: 'No speech detected. Please speak clearly into your microphone.',
    };
  }

  let totalScore = 0;
  let correctCount = 0;

  // Evaluate each target word against spoken tokens
  const wordEvaluations = targetWords.map((tWord, idx) => {
    let bestSim = 0;

    // Search around expected position (+/- 2 words)
    const windowStart = Math.max(0, idx - 2);
    const windowEnd = Math.min(spokenWords.length, idx + 3);

    for (let j = windowStart; j < windowEnd; j++) {
      const sim = wordSimilarity(tWord, spokenWords[j]);
      if (sim > bestSim) bestSim = sim;
    }

    // Fallback: check all spoken words
    if (bestSim < 0.6) {
      for (const sWord of spokenWords) {
        const sim = wordSimilarity(tWord, sWord);
        if (sim > bestSim) bestSim = sim;
      }
    }

    let status = 'missed';
    let score = 0;

    if (bestSim >= 0.85) {
      status = 'correct';
      score = 100;
      correctCount++;
    } else if (bestSim >= 0.6) {
      status = 'partial';
      score = Math.round(bestSim * 100);
      correctCount += 0.7;
    } else {
      status = 'missed';
      score = 0;
    }

    totalScore += score;
    return {
      word: tWord,
      status,
      score,
    };
  });

  const overallScore = Math.round(totalScore / targetWords.length);
  const completenessScore = Math.round((correctCount / targetWords.length) * 100);

  // Fluency estimation based on completeness and speech length balance
  const lengthBalance = Math.min(1.0, spokenWords.length / targetWords.length);
  const fluencyScore = Math.round(overallScore * 0.7 + lengthBalance * 30);

  let feedback = 'Needs improvement. Practice repeating after the audio model.';
  if (overallScore >= 90) {
    feedback = '🌟 Excellent! Clear, fluent, and accurate pronunciation.';
  } else if (overallScore >= 75) {
    feedback = '👍 Good job! Most words are clear. Practice the yellow/red words.';
  } else if (overallScore >= 50) {
    feedback = '⚠️ Moderate. Speak slowly and articulate word endings.';
  }

  return {
    overallScore,
    fluencyScore,
    completenessScore,
    wordEvaluations,
    feedback,
  };
};
