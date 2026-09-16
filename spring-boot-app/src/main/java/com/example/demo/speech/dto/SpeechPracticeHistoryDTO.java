package com.example.demo.speech.dto;

import com.example.demo.speech.model.PracticeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * DTO: SpeechPracticeHistoryDTO
 * ============================================================================
 * Carries practice session record details between frontend and backend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeechPracticeHistoryDTO {
    private Long id;
    private PracticeType practiceType;
    private String targetText;
    private String recognizedText;
    private Double score;
    private Double fluencyScore;
    private Double accuracyScore;
    private LocalDateTime createdAt;
}
