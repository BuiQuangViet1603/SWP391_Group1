package com.example.demo.speech.repository;

import com.example.demo.speech.model.PracticeType;
import com.example.demo.speech.model.SpeechPracticeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ============================================================================
 * Repository: SpeechPracticeHistoryRepository
 * ============================================================================
 * Handles database operations for speech practice history records and
 * aggregate performance statistics.
 */
@Repository
public interface SpeechPracticeHistoryRepository extends JpaRepository<SpeechPracticeHistory, Long> {

    /**
     * Retrieve the most recent 20 practice sessions across all types.
     */
    List<SpeechPracticeHistory> findTop20ByOrderByCreatedAtDesc();

    /**
     * Retrieve history records filtered by specific practice type.
     */
    List<SpeechPracticeHistory> findByPracticeTypeOrderByCreatedAtDesc(PracticeType practiceType);

    /**
     * Calculate overall average practice score.
     */
    @Query("SELECT COALESCE(AVG(h.score), 0.0) FROM SpeechPracticeHistory h")
    Double getOverallAverageScore();

    /**
     * Calculate average score for a specific practice type.
     */
    @Query("SELECT COALESCE(AVG(h.score), 0.0) FROM SpeechPracticeHistory h WHERE h.practiceType = :practiceType")
    Double getAverageScoreByType(@Param("practiceType") PracticeType practiceType);

    /**
     * Count total practice sessions completed.
     */
    long count();
}
