package com.example.demo.speech.model;

import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================================
 * Entity: DifficultWord
 * ============================================================================
 * Keeps track of words that the student struggled with (score < 70) during
 * pronunciation, shadowing, or speaking practice for targeted review.
 */
@Entity
@Table(name = "difficult_words")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DifficultWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /** The word the user struggled to pronounce accurately */
    @Column(nullable = false)
    private String word;

    /** Optional IPA phonetic notation */
    private String phonetic;

    /** Number of times this word was mispronounced */
    @Builder.Default
    private Integer errorCount = 1;

    /** Most recent practice timestamp */
    @Builder.Default
    private LocalDateTime lastPracticed = LocalDateTime.now();
}
