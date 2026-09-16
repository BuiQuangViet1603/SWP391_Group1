package com.example.demo.speech.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================================
 * DTO: WordEvaluationDTO
 * ============================================================================
 * Represents evaluation result for a single word in a pronunciation assessment.
 * Status values:
 * - CORRECT: Word pronounced accurately
 * - PARTIAL: Minor pronunciation or spelling variation (e.g. singular/plural)
 * - MISSED: Expected word was omitted or mispronounced completely
 * - EXTRA: Spoken word was an extra insertion not in the target text
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordEvaluationDTO {
    /** The target or spoken word */
    private String word;

    /** Evaluation status: CORRECT, PARTIAL, MISSED, EXTRA */
    private String status;

    /** Word accuracy score (0 - 100) */
    private double score;
}
