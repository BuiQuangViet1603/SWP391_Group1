package com.example.demo.speech.controller;

import com.example.demo.speech.dto.*;
import com.example.demo.speech.model.PracticeType;
import com.example.demo.speech.service.PronunciationEvaluatorService;
import com.example.demo.speech.service.SpeechPracticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ============================================================================
 * Controller: SpeechPracticeController
 * ============================================================================
 * REST API Controller exposing endpoints for:
 * 1. Saving and retrieving speech practice history
 * 2. Fetching progress analytics, averages by PracticeType, and difficult words
 * 3. Managing speech settings (rate, pitch, volume, voice accent, auto-play)
 * 4. Server-side algorithmic pronunciation evaluation
 */
@RestController
@RequestMapping("/api/speech")
@CrossOrigin(origins = "*")
public class SpeechPracticeController {

    @Autowired
    private SpeechPracticeService practiceService;

    @Autowired
    private PronunciationEvaluatorService evaluatorService;

    /**
     * Save a completed speech practice attempt.
     *
     * @param dto practice session data
     * @return success confirmation with saved record ID
     */
    @PostMapping("/history")
    public ResponseEntity<?> saveHistory(@RequestBody SpeechPracticeHistoryDTO dto) {
        var saved = practiceService.savePracticeHistory(dto);
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Practice history recorded successfully",
                "id", saved.getId()
        ));
    }

    /**
     * Retrieve practice history logs, optionally filtered by PracticeType.
     *
     * @param type optional PracticeType filter (READING, SHADOWING, LISTENING, SPEAKING, CONVERSATION)
     * @return list of practice history DTOs
     */
    @GetMapping("/history")
    public ResponseEntity<List<SpeechPracticeHistoryDTO>> getHistory(
            @RequestParam(value = "type", required = false) PracticeType type) {
        return ResponseEntity.ok(practiceService.getHistory(type));
    }

    /**
     * Retrieve student speech progress summary, analytics, and difficult words.
     *
     * @return SpeechProgressSummaryDTO
     */
    @GetMapping("/progress")
    public ResponseEntity<SpeechProgressSummaryDTO> getProgress() {
        return ResponseEntity.ok(practiceService.getProgressSummary());
    }

    /**
     * Retrieve user speech configuration settings.
     *
     * @return SpeechSettingDTO
     */
    @GetMapping("/settings")
    public ResponseEntity<SpeechSettingDTO> getSettings() {
        return ResponseEntity.ok(practiceService.getSettings());
    }

    /**
     * Update user speech configuration settings.
     *
     * @param dto new settings values
     * @return updated SpeechSettingDTO
     */
    @PutMapping("/settings")
    public ResponseEntity<SpeechSettingDTO> updateSettings(@RequestBody SpeechSettingDTO dto) {
        return ResponseEntity.ok(practiceService.updateSettings(dto));
    }

    /**
     * Run server-side algorithmic pronunciation evaluation.
     *
     * @param request target and spoken sentences
     * @return PronunciationEvaluationResultDTO with score and word diffs
     */
    @PostMapping("/evaluate")
    public ResponseEntity<PronunciationEvaluationResultDTO> evaluatePronunciation(
            @RequestBody PronunciationEvaluationRequestDTO request) {
        return ResponseEntity.ok(evaluatorService.evaluate(request));
    }
}
