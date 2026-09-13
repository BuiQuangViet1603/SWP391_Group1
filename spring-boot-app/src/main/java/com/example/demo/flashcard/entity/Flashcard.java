package com.example.demo.flashcard.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "flashcards")
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "deck_id")
    private Deck deck;

    private String vocabulary;
    private String meaning;
    private String phonetic;
    @Column(columnDefinition = "TEXT")
    private String exampleSentence;
}
