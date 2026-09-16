package com.example.demo.speech.service;

import com.example.demo.speech.dto.SpeechPracticeHistoryDTO;
import com.example.demo.speech.dto.SpeechProgressSummaryDTO;
import com.example.demo.speech.dto.SpeechSettingDTO;
import com.example.demo.speech.model.DifficultWord;
import com.example.demo.speech.model.PracticeType;
import com.example.demo.speech.model.SpeechPracticeHistory;
import com.example.demo.speech.model.UserSpeechSetting;
import com.example.demo.speech.repository.DifficultWordRepository;
import com.example.demo.speech.repository.SpeechPracticeHistoryRepository;
import com.example.demo.speech.repository.UserSpeechSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ============================================================================
 * Service: SpeechPracticeService
 * ============================================================================
 * Coordinates the storage of student speech practice sessions, handles
 * performance statistics, maintains the difficult words watchlist, and manages
 * speech configuration settings.
 */
@Service
public class SpeechPracticeService {

    @Autowired
    private SpeechPracticeHistoryRepository historyRepository;

    @Autowired
    private DifficultWordRepository difficultWordRepository;

    @Autowired
    private UserSpeechSettingRepository settingRepository;

    /**
     * Record a completed practice attempt and update difficult word tracking if score < 70%.
     *
     * @param dto input details of the practice attempt
     * @return saved SpeechPracticeHistory entity
     */
    @Transactional
    public SpeechPracticeHistory savePracticeHistory(SpeechPracticeHistoryDTO dto) {
        SpeechPracticeHistory history = SpeechPracticeHistory.builder()
                .practiceType(dto.getPracticeType() != null ? dto.getPracticeType() : PracticeType.SPEAKING)
                .targetText(dto.getTargetText())
                .recognizedText(dto.getRecognizedText())
                .score(dto.getScore() != null ? dto.getScore() : 0.0)
                .fluencyScore(dto.getFluencyScore() != null ? dto.getFluencyScore() : 0.0)
                .accuracyScore(dto.getAccuracyScore() != null ? dto.getAccuracyScore() : 0.0)
                .createdAt(LocalDateTime.now())
                .build();

        SpeechPracticeHistory saved = historyRepository.save(history);

        // If the practice score is low (< 70), identify challenging words for the watchlist
        if (dto.getScore() != null && dto.getScore() < 70 && dto.getTargetText() != null) {
            trackDifficultWordsFromText(dto.getTargetText());
        }

        return saved;
    }

    /**
     * Retrieve practice history records, optionally filtered by PracticeType.
     *
     * @param practiceType optional filter by PracticeType
     * @return list of history DTOs
     */
    public List<SpeechPracticeHistoryDTO> getHistory(PracticeType practiceType) {
        List<SpeechPracticeHistory> list;
        if (practiceType != null) {
            list = historyRepository.findByPracticeTypeOrderByCreatedAtDesc(practiceType);
        } else {
            list = historyRepository.findTop20ByOrderByCreatedAtDesc();
        }

        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Aggregate overall student speech progress and analytics.
     *
     * @return SpeechProgressSummaryDTO with metrics and recent history
     */
    public SpeechProgressSummaryDTO getProgressSummary() {
        long totalSessions = historyRepository.count();
        Double overallAvg = historyRepository.getOverallAverageScore();

        // Calculate average score for each PracticeType
        Map<String, Double> averageByType = new HashMap<>();
        for (PracticeType type : PracticeType.values()) {
            Double typeAvg = historyRepository.getAverageScoreByType(type);
            averageByType.put(type.name(), typeAvg != null ? Math.round(typeAvg * 10.0) / 10.0 : 0.0);
        }

        // Fetch top difficult words
        List<DifficultWord> difficultWords = difficultWordRepository.findTop10ByOrderByErrorCountDesc();

        // Fetch recent 10 sessions
        List<SpeechPracticeHistoryDTO> recent = historyRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return SpeechProgressSummaryDTO.builder()
                .totalSessions(totalSessions)
                .overallAverageScore(overallAvg != null ? Math.round(overallAvg * 10.0) / 10.0 : 0.0)
                .practiceStreakDays(totalSessions > 0 ? 3 : 0) // baseline streak estimation
                .averageScoreByType(averageByType)
                .difficultWords(difficultWords)
                .recentHistory(recent)
                .build();
    }

    /**
     * Retrieve speech configuration settings.
     */
    public SpeechSettingDTO getSettings() {
        return settingRepository.findTopByOrderByIdDesc()
                .map(s -> SpeechSettingDTO.builder()
                        .voiceName(s.getVoiceName())
                        .speechRate(s.getSpeechRate())
                        .pitch(s.getPitch())
                        .volume(s.getVolume())
                        .autoPlayAudio(s.getAutoPlayAudio())
                        .build())
                .orElse(SpeechSettingDTO.builder()
                        .voiceName("Google US English")
                        .speechRate(1.0)
                        .pitch(1.0)
                        .volume(1.0)
                        .autoPlayAudio(true)
                        .build());
    }

    /**
     * Save updated speech configuration settings.
     */
    @Transactional
    public SpeechSettingDTO updateSettings(SpeechSettingDTO dto) {
        UserSpeechSetting setting = settingRepository.findTopByOrderByIdDesc()
                .orElse(new UserSpeechSetting());

        if (dto.getVoiceName() != null) setting.setVoiceName(dto.getVoiceName());
        if (dto.getSpeechRate() != null) setting.setSpeechRate(dto.getSpeechRate());
        if (dto.getPitch() != null) setting.setPitch(dto.getPitch());
        if (dto.getVolume() != null) setting.setVolume(dto.getVolume());
        if (dto.getAutoPlayAudio() != null) setting.setAutoPlayAudio(dto.getAutoPlayAudio());

        UserSpeechSetting saved = settingRepository.save(setting);

        return SpeechSettingDTO.builder()
                .voiceName(saved.getVoiceName())
                .speechRate(saved.getSpeechRate())
                .pitch(saved.getPitch())
                .volume(saved.getVolume())
                .autoPlayAudio(saved.getAutoPlayAudio())
                .build();
    }

    /**
     * Extract significant words (> 4 letters) from difficult text and increment their error counter.
     */
    private void trackDifficultWordsFromText(String targetText) {
        String clean = targetText.toLowerCase().replaceAll("[^a-z\\s]", " ").trim();
        String[] words = clean.split("\\s+");

        for (String w : words) {
            if (w.length() > 4) { // Focus on meaningful words rather than articles
                Optional<DifficultWord> existing = difficultWordRepository.findByWordIgnoreCase(w);
                if (existing.isPresent()) {
                    DifficultWord dw = existing.get();
                    dw.setErrorCount(dw.getErrorCount() + 1);
                    dw.setLastPracticed(LocalDateTime.now());
                    difficultWordRepository.save(dw);
                } else {
                    DifficultWord newDw = DifficultWord.builder()
                            .word(w)
                            .errorCount(1)
                            .lastPracticed(LocalDateTime.now())
                            .build();
                    difficultWordRepository.save(newDw);
                }
            }
        }
    }

    private SpeechPracticeHistoryDTO mapToDTO(SpeechPracticeHistory h) {
        return SpeechPracticeHistoryDTO.builder()
                .id(h.getId())
                .practiceType(h.getPracticeType())
                .targetText(h.getTargetText())
                .recognizedText(h.getRecognizedText())
                .score(h.getScore())
                .fluencyScore(h.getFluencyScore())
                .accuracyScore(h.getAccuracyScore())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
