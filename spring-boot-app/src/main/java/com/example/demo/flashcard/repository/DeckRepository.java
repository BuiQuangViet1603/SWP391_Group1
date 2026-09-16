package com.example.demo.flashcard.repository;

import com.example.demo.flashcard.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ============================================================================
 * Repository: DeckRepository
 * ============================================================================
 * Provides data access operations for Deck entities.
 */
@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {

    /**
     * Search decks by name (case-insensitive partial match).
     *
     * @param name search query term
     * @return list of matching decks
     */
    List<Deck> findByNameContainingIgnoreCase(String name);
}
