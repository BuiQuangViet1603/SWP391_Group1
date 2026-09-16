package com.example.demo.speech.service;

import com.example.demo.speech.dto.PronunciationEvaluationRequestDTO;
import com.example.demo.speech.dto.PronunciationEvaluationResultDTO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class PronunciationEvaluatorServiceTest {

    private final PronunciationEvaluatorService service = new PronunciationEvaluatorService();

    @Test
    public void testExactMatch() {
        PronunciationEvaluationRequestDTO request = PronunciationEvaluationRequestDTO.builder()
                .targetText("Practice makes perfect.")
                .spokenText("Practice makes perfect.")
                .build();

        PronunciationEvaluationResultDTO result = service.evaluate(request);

        assertEquals(100.0, result.getOverallScore());
        assertEquals(100.0, result.getCompletenessScore());
        assertEquals(3, result.getWordEvaluations().size());
        assertEquals("CORRECT", result.getWordEvaluations().get(0).getStatus());
    }

    @Test
    public void testPartialAndMissedWords() {
        PronunciationEvaluationRequestDTO request = PronunciationEvaluationRequestDTO.builder()
                .targetText("Learning a new language opens doors.")
                .spokenText("Learning new languag opens")
                .build();

        PronunciationEvaluationResultDTO result = service.evaluate(request);

        assertTrue(result.getOverallScore() > 40 && result.getOverallScore() < 95);
        assertNotNull(result.getFeedback());
    }

    @Test
    public void testEmptySpeechInput() {
        PronunciationEvaluationRequestDTO request = PronunciationEvaluationRequestDTO.builder()
                .targetText("Hello world")
                .spokenText("")
                .build();

        PronunciationEvaluationResultDTO result = service.evaluate(request);

        assertEquals(0.0, result.getOverallScore());
        assertEquals(2, result.getWordEvaluations().size());
        assertEquals("MISSED", result.getWordEvaluations().get(0).getStatus());
    }
}
