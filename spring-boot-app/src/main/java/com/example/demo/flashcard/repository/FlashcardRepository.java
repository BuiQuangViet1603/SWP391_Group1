package com.example.demo.flashcard.repository;

import com.example.demo.flashcard.entity.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ============================================================================
 * Repository: FlashcardRepository
 * ============================================================================
 * Provides data access operations for Flashcard entities.
 */
@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    /**
     * Search flashcards by vocabulary or meaning (case-insensitive partial match).
     *
     * @param vocabulary search query term for vocabulary
     * @param meaning search query term for meaning
     * @return list of matching flashcards
     */
    List<Flashcard> findByVocabularyContainingIgnoreCaseOrMeaningContainingIgnoreCase(
            String vocabulary, String meaning);
}
