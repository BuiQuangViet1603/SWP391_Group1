package com.example.demo.search.controller;

import com.example.demo.flashcard.entity.Deck;
import com.example.demo.flashcard.entity.Flashcard;
import com.example.demo.flashcard.repository.DeckRepository;
import com.example.demo.flashcard.repository.FlashcardRepository;
import com.example.demo.search.dto.SearchResultDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * ============================================================================
 * Controller: SearchController
 * ============================================================================
 * Handles voice-driven and text-driven search requests against the local
 * database (Flashcards and Decks).
 *
 * Endpoint:
 * - GET /api/search?q={query}: Search flashcards and decks matching the query.
 */
@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private FlashcardRepository flashcardRepository;

    @Autowired
    private DeckRepository deckRepository;

    /**
     * Search across flashcards (vocabulary, meaning) and decks (name).
     *
     * @param query the keyword spoken or typed by the user
     * @return SearchResultDTO containing matching flashcards, decks, and counts
     */
    @GetMapping
    public ResponseEntity<SearchResultDTO> search(@RequestParam(value = "q", defaultValue = "") String query) {
        String trimmedQuery = query.trim();

        if (trimmedQuery.isEmpty()) {
            return ResponseEntity.ok(SearchResultDTO.builder()
                    .query("")
                    .flashcards(Collections.emptyList())
                    .decks(Collections.emptyList())
                    .totalCount(0)
                    .build());
        }

        // Query flashcards where vocabulary or meaning matches
        List<Flashcard> matchingFlashcards = flashcardRepository
                .findByVocabularyContainingIgnoreCaseOrMeaningContainingIgnoreCase(trimmedQuery, trimmedQuery);

        // Query decks where deck name matches
        List<Deck> matchingDecks = deckRepository
                .findByNameContainingIgnoreCase(trimmedQuery);

        SearchResultDTO result = SearchResultDTO.builder()
                .query(trimmedQuery)
                .flashcards(matchingFlashcards)
                .decks(matchingDecks)
                .totalCount(matchingFlashcards.size() + matchingDecks.size())
                .build();

        return ResponseEntity.ok(result);
    }
}
