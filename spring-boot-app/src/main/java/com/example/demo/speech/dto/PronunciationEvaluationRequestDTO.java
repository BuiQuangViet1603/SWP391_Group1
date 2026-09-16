package com.example.demo.speech.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================================
 * DTO: PronunciationEvaluationRequestDTO
 * ============================================================================
 * Carries the expected target text and the user's spoken transcription for
 * pronunciation scoring.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PronunciationEvaluationRequestDTO {
    /** The target text the user was expected to say */
    private String targetText;

    /** The transcription produced by Speech-to-Text from user's voice */
    private String spokenText;
}
