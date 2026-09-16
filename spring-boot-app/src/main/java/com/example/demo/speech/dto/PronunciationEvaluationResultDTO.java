package com.example.demo.speech.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ============================================================================
 * DTO: PronunciationEvaluationResultDTO
 * ============================================================================
 * Comprehensive response from the Pronunciation Assessment engine.
 * Includes overall score, fluency estimate, word-by-word status chips, and
 * actionable feedback tips for the learner.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PronunciationEvaluationResultDTO {
    /** Overall Pronunciation Accuracy Score (0 - 100) */
    private double overallScore;

    /** Estimated Fluency Score (0 - 100) */
    private double fluencyScore;

    /** Completeness Score (percentage of target words spoken) */
    private double completenessScore;

    /** Detailed word-by-word evaluation */
    private List<WordEvaluationDTO> wordEvaluations;

    /** Feedback suggestion for the student */
    private String feedback;
}
