package com.example.demo.speech.model;

/**
 * ============================================================================
 * Enum: PracticeType
 * ============================================================================
 * Unified enumeration grouping all language speech practice modes into
 * distinct types:
 * - LISTENING: Audio prompts, dictation, and comprehension quizzes.
 * - SPEAKING: Pronouncing individual target vocabulary or sentences.
 * - READING: Reading aloud passages with synchronized audio guidance.
 * - SHADOWING: 3-step imitation loop (Listen -> Repeat -> Compare).
 * - CONVERSATION: Multi-turn interactive dialogue simulation.
 */
public enum PracticeType {
    LISTENING,
    SPEAKING,
    READING,
    SHADOWING,
    CONVERSATION
}
