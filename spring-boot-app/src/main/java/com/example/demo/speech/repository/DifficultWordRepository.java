package com.example.demo.speech.repository;

import com.example.demo.speech.model.DifficultWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================================
 * Repository: DifficultWordRepository
 * ============================================================================
 * Data access operations for difficult words tracking.
 */
@Repository
public interface DifficultWordRepository extends JpaRepository<DifficultWord, Long> {

    /**
     * Retrieve top 10 most frequently mispronounced words ordered by error count.
     */
    List<DifficultWord> findTop10ByOrderByErrorCountDesc();

    /**
     * Look up word by text (case-insensitive).
     */
    Optional<DifficultWord> findByWordIgnoreCase(String word);
}
