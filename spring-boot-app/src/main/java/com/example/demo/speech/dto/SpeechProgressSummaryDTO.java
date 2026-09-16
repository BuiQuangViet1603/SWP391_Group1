package com.example.demo.speech.dto;

import com.example.demo.speech.model.DifficultWord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * DTO: SpeechProgressSummaryDTO
 * ============================================================================
 * Comprehensive student speech analytics payload, including total practice count,
 * average accuracy scores by PracticeType, recent history, and mispronounced words.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechProgressSummaryDTO {
    /** Total number of practice sessions recorded */
    private long totalSessions;

    /** Overall average score across all practice activities (0 - 100) */
    private double overallAverageScore;

    /** Estimated practice streak in days */
    private int practiceStreakDays;

    /** Average score broken down by PracticeType */
    private Map<String, Double> averageScoreByType;

    /** Top difficult/challenging words needing spaced review */
    private List<DifficultWord> difficultWords;

    /** Recent practice attempts */
    private List<SpeechPracticeHistoryDTO> recentHistory;
}
