package com.example.demo.search.dto;

import com.example.demo.flashcard.entity.Deck;
import com.example.demo.flashcard.entity.Flashcard;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ============================================================================
 * DTO: SearchResultDTO
 * ============================================================================
 * Encapsulates the results of a multi-entity database search triggered by
 * speech or text queries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {
    /** The search query term */
    private String query;

    /** Flashcards matching the search query */
    private List<Flashcard> flashcards;

    /** Decks matching the search query */
    private List<Deck> decks;

    /** Total count of matching items */
    private int totalCount;
}
