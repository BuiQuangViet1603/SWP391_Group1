package com.example.demo.flashcard.controller;

import com.example.demo.flashcard.dto.DeckDto;
import com.example.demo.flashcard.entity.Deck;
import com.example.demo.flashcard.entity.Flashcard;
import com.example.demo.flashcard.repository.DeckRepository;
import com.example.demo.flashcard.repository.FlashcardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // Allow React to connect
public class FlashcardController {

    @Autowired
    private DeckRepository deckRepository;

    @Autowired
    private FlashcardRepository flashcardRepository;

    @GetMapping
    public ResponseEntity<List<DeckDto>> getAllDecks() {
        List<DeckDto> decks = deckRepository.findAllDecksWithFlashcardCount();
        return ResponseEntity.ok(decks);
    }

    @PostMapping
    public ResponseEntity<Deck> createDeck(@RequestBody Deck deck) {
        Deck savedDeck = deckRepository.save(deck);
        return ResponseEntity.ok(savedDeck);
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<Deck> getDeckById(@PathVariable Long deckId) {
        return deckRepository.findById(deckId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{deckId}/flashcards")
    public ResponseEntity<List<Flashcard>> getFlashcardsByDeck(@PathVariable Long deckId) {
        List<Flashcard> flashcards = flashcardRepository.findByDeckId(deckId);
        return ResponseEntity.ok(flashcards);
    }

    @PostMapping("/{deckId}/flashcards")
    public ResponseEntity<Flashcard> addFlashcardToDeck(@PathVariable Long deckId, @RequestBody Flashcard flashcard) {
        return deckRepository.findById(deckId).map(deck -> {
            flashcard.setDeck(deck);
            Flashcard savedCard = flashcardRepository.save(flashcard);
            return ResponseEntity.ok(savedCard);
        }).orElse(ResponseEntity.notFound().build());
    }
}
